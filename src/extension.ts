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
import { getAddSessionCommand } from "./commands/addSessionCommand";
import { getNewCopyCommand } from "./commands/newCopyCommand";
import { getRefreshCommand } from "./commands/refreshCommand";
import { ExtensionContext, window } from "vscode";
import { getPhaseInCommand } from "./commands/phaseInCommand";
import { CICSTreeDataProvider } from "./trees/treeProvider";
import { CicsApi } from "./utils/CicsSession";
import {
  getShowAttributesCommand,
  getShowRegionAttributes,
} from "./commands/showAttributesCommand";
import { getFilterProgramsCommand } from "./commands/filterProgramsCommand";
import { ProfileManagement } from "./utils/profileManagement";

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

  if (ProfileManagement.apiDoesExist()) {
    /**
     * This line will change when the profilesCache can take a new profile type to cache on refresh,
     * an addition planned for PI3.
     * 
     * - This will also stop profiles leaking into MVS tree
     * 
     */
    ProfileManagement.getExplorerApis().registerMvsApi(new CicsApi());
    /** */
    await ProfileManagement.getExplorerApis().getExplorerExtenderApi().reloadProfiles();
    window.showInformationMessage(
      "Zowe Explorer was modified for the CICS Extension"
    );
    const defaultCicsProfile = ProfileManagement.getProfilesCache().getDefaultProfile('cics');
    if (defaultCicsProfile) {
      window.showInformationMessage(
        `Default CICS Profile (${defaultCicsProfile.name}) found. Loading it now...`
      );
      treeDataProv.loadExistingProfile(defaultCicsProfile);
    } else {
      window.showInformationMessage("No Default CICS Profile found.");
    }
  }
}

export function deactivate() { }
