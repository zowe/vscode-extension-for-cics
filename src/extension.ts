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
import { CicsApi } from "./utils/CicsSession";
import {
  getShowAttributesCommand,
  getShowRegionAttributes,
} from "./commands/showAttributesCommand";
import { getFilterProgramsCommand } from "./commands/filterProgramsCommand";
import { ProfileManagement } from "./utils/profileManagement";
import { CICSTree } from "./trees/CICSTree";

export async function activate(context: ExtensionContext) {

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
  }

  const treeDataProv = new CICSTree();
  window
    .createTreeView("cics-view", {
      treeDataProvider: treeDataProv,
      showCollapseAll: true,
    })
    .onDidExpandElement((node) => {
      if (node.element.contextValue.includes("cicssession.")) {
      } else if (node.element.contextValue.includes("cicsplex.")) {
      } else if (node.element.contextValue.includes("cicsregion.")) {
        // Load region contents
        treeDataProv.loadRegionContents(node.element);
      } else if (node.element.contextValue.includes("cicsprogram.")) {
      }
    });

  context.subscriptions.push(
    getAddSessionCommand(treeDataProv),
    // getRefreshCommand(treeDataProv),
    getNewCopyCommand(treeDataProv),
    getShowAttributesCommand(),
    getPhaseInCommand(treeDataProv),
    getShowRegionAttributes(),
    getEnableProgramCommand(treeDataProv),
    getDisableProgramCommand(treeDataProv),
    getRemoveSessionCommand(treeDataProv),
    getFilterProgramsCommand(treeDataProv)
  );
}

export function deactivate() { }
