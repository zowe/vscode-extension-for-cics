/*
* This program and the accompanying materials are made available under the terms of the
* Eclipse Public License v2.0 which accompanies this distribution, and is available at
* https://www.eclipse.org/legal/epl-v20.html
*
* SPDX-License-Identifier: EPL-2.0
*
* Copyright Contributors to the Zowe Project.
*
*/

import { getDisableProgramCommand } from "./commands/disableProgramCommand";
import { getRemoveSessionCommand } from "./commands/removeSessionCommand";
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
import { getFilterProgramsCommand } from "./commands/filterProgramsCommand";

export async function activate(context: ExtensionContext) {
  const treeDataProv = new CICSTreeDataProvider();
  window
    .createTreeView("cics-view", {
      treeDataProvider: treeDataProv,
      showCollapseAll: true,
    })
    .onDidExpandElement((node) => {
      if (node.element.session) {
      } else if (node.element.region) {
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
    getRemoveSessionCommand(treeDataProv),
    getFilterProgramsCommand(treeDataProv)
  );

  const zoweExplorerApi = extensions.getExtension(
    "Zowe.vscode-extension-for-zowe"
  );

  if (zoweExplorerApi && zoweExplorerApi.exports) {
    const importedApi =
      zoweExplorerApi.exports as ZoweExplorerApi.IApiRegisterClient;

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

      const profileStorage = new ProfileStorage();

      // @ts-ignore
      for (const profile of prof.profilesByType) {
        if (profile[0] === "cics") {
          profileStorage.setProfiles(profile[1]);
          break;
        }
      }

      if (defaultProfile && defaultProfile.profile) {
        window.showInformationMessage(
          `Default CICS Profile (${defaultProfile.name}) found. Loading it now...`
        );
        treeDataProv.loadExistingProfile(defaultProfile);
        // treeDataProv.addSession(defaultProfile);
      } else {
        window.showInformationMessage("No Default CICS Profile found.");
      }
    }
  }
}

export function deactivate() {}
