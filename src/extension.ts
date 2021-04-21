import { ZoweExplorerApi, ProfilesCache } from "@zowe/zowe-explorer-api";
import { getAddSessionCommand } from "./commands/addSessionCommand";
import { loadProfileManager } from "./utils/profileManagement";
import { getNewCopyCommand } from "./commands/newCopyCommand";
import { getRefreshCommand } from "./commands/refreshCommand";
import { ExtensionContext, window, extensions } from "vscode";
import { getPhaseInCommand } from "./commands/phaseInCommand";
import { CICSTreeDataProvider } from "./trees/treeProvider";
import { ProfileStorage } from "./utils/profileStorage";
import { CicsApi } from "./utils/CicsSession";
import { Logger } from "@zowe/imperative";
import {
  getShowAttributesCommand,
  getShowRegionAttributes,
} from "./commands/showAttributesCommand";

export async function activate(context: ExtensionContext) {
  const treeDataProv = new CICSTreeDataProvider();
  window.createTreeView("cics-view", {
    treeDataProvider: treeDataProv,
    showCollapseAll: true,
  });

  context.subscriptions.push(
    getAddSessionCommand(treeDataProv),
    getRefreshCommand(treeDataProv),
    getNewCopyCommand(),
    getShowAttributesCommand(),
    getPhaseInCommand(),
    getShowRegionAttributes()
  );

  const zoweExplorerApi = extensions.getExtension(
    "Zowe.vscode-extension-for-zowe"
  );

  if (zoweExplorerApi && zoweExplorerApi.exports) {
    const importedApi = zoweExplorerApi.exports as ZoweExplorerApi.IApiRegisterClient;

    importedApi.registerMvsApi(new CicsApi());

    window.showInformationMessage(
      "Zowe Explorer was modified for the CICS Extension"
    );

    if (
      importedApi.getExplorerExtenderApi &&
      importedApi.getExplorerExtenderApi().reloadProfiles
    ) {
      await loadProfileManager();

      const prof = new ProfilesCache(Logger.getAppLogger());
      await prof.refresh(importedApi);
      await importedApi.getExplorerExtenderApi().reloadProfiles();
      const defaultProfile = prof.getDefaultProfile("cics");

      let profileStorage = new ProfileStorage();

      for (const profile of prof.profilesByType) {
        if (profile[0] === "cics") {
          profileStorage.setProfiles(profile[1]);
          break;
        }
      }

      if (defaultProfile && defaultProfile.profile) {
        treeDataProv.addSession(defaultProfile);
      }
    }
  }
}

export function deactivate() {}
