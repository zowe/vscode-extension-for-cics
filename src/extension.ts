import { getDisableProgramCommand } from "./commands/disableProgramCommand";
import { getEnableProgramCommand } from "./commands/enableProgramCommand";
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
import { getRemoveSessionCommand } from "./commands/removeSessionCommand";

export async function activate(context: ExtensionContext) {
  const treeDataProv = new CICSTreeDataProvider();
  const view = window.createTreeView("cics-view", {
    treeDataProvider: treeDataProv,
    showCollapseAll: true,
  });

  view.onDidExpandElement((node) => {
    if (node.element.session) {
      //session
    } else if (node.element.region) {
      //region
      treeDataProv.loadPrograms(node.element);
    }
  });

  context.subscriptions.push(
    getAddSessionCommand(treeDataProv),
    getRefreshCommand(treeDataProv),
    getNewCopyCommand(treeDataProv),
    getShowAttributesCommand(),
    getPhaseInCommand(treeDataProv),
    getShowRegionAttributes(),
    getEnableProgramCommand(treeDataProv),
    getDisableProgramCommand(treeDataProv),
    getRemoveSessionCommand(treeDataProv)
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

      // @ts-ignore
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
