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
import { ExtensionContext, window } from "vscode";
import { getPhaseInCommand } from "./commands/phaseInCommand";
import {
  getShowAttributesCommand,
  getShowRegionAttributes,
} from "./commands/showAttributesCommand";
import { getFilterProgramsCommand } from "./commands/filterProgramsCommand";
import { ProfileManagement } from "./utils/profileManagement";
import { CICSTree } from "./trees/CICSTree";
import { getShowTransactionAttributesCommand } from "./commands/showTransactionAttributesCommand";
import { getShowLocalFileAttributesCommand } from "./commands/showLocalFileAttributesCommand";
import { getFilterTransactionCommand } from "./commands/filterTransactionCommand";
import { getClearProgramFilterCommand } from "./commands/clearProgramFilterCommand";
import { getFilterLocalFilesCommand } from "./commands/filterLocalFileCommand";
import { getFilterPlexResources } from "./commands/getFilterPlexResources";
import { getClearPlexFilterCommand } from "./commands/clearPlexFilterCommand";
import { getRefreshCommand } from "./commands/refreshCommand";
import { getUpdateSessionCommand } from "./commands/updateSessionCommand";
import { getDeleteSessionCommand } from "./commands/deleteSessionCommand";
import { getDisableTransactionCommand } from "./commands/disableTransactionCommand";
import { getEnableTransactionCommand } from "./commands/enableTransactionCommand";
import { getEnableLocalFileCommand } from "./commands/enableLocalFileCommand";
import { getDisableLocalFileCommand } from "./commands/disableLocalFileCommand";
import { getCloseLocalFileCommand } from "./commands/closeLocalFileCommand";
import { getOpenLocalFileCommand } from "./commands/openLocalFileCommand";

export async function activate(context: ExtensionContext) {

  if (ProfileManagement.apiDoesExist()) {
    await ProfileManagement.registerCICSProfiles();
    ProfileManagement.getProfilesCache().registerCustomProfilesType('cics');
    await ProfileManagement.getExplorerApis().getExplorerExtenderApi().reloadProfiles();
    window.showInformationMessage(
      "Zowe Explorer was modified for the CICS Extension"
    );
  }

  const treeDataProv = new CICSTree();
  const treeview = window
    .createTreeView("cics-view", {
      treeDataProvider: treeDataProv,
      showCollapseAll: true,
      canSelectMany: true
    });

  treeview.onDidExpandElement(async (node) => {
    if (node.element.contextValue.includes("cicssession.")) {
    } else if (node.element.contextValue.includes("cicsplex.")) {
    } else if (node.element.contextValue.includes("cicsregion.")) {

      for (const child of node.element.children) {
        await child.loadContents();
      }
      treeDataProv._onDidChangeTreeData.fire(undefined);

    } else if (node.element.contextValue.includes("cicsprogram.")) {
    }
  });


  context.subscriptions.push(
    getAddSessionCommand(treeDataProv),
    getRemoveSessionCommand(treeDataProv, treeview),
    getUpdateSessionCommand(treeDataProv),
    getDeleteSessionCommand(treeDataProv, treeview),

    getRefreshCommand(treeDataProv),

    getNewCopyCommand(treeDataProv, treeview),
    getPhaseInCommand(treeDataProv, treeview),

    getEnableProgramCommand(treeDataProv, treeview),
    getDisableProgramCommand(treeDataProv, treeview),
    getEnableTransactionCommand(treeDataProv, treeview),
    getDisableTransactionCommand(treeDataProv, treeview),
    getEnableLocalFileCommand(treeDataProv, treeview),
    getDisableLocalFileCommand(treeDataProv, treeview),

    getCloseLocalFileCommand(treeDataProv, treeview),
    getOpenLocalFileCommand(treeDataProv, treeview),

    getShowRegionAttributes(),
    getShowAttributesCommand(),
    getShowTransactionAttributesCommand(),
    getShowLocalFileAttributesCommand(),

    getFilterProgramsCommand(treeDataProv),
    getFilterTransactionCommand(treeDataProv),
    getFilterLocalFilesCommand(treeDataProv),

    getFilterPlexResources(treeDataProv),

    getClearProgramFilterCommand(treeDataProv),
    getClearPlexFilterCommand(treeDataProv)
  );
}

export function deactivate() { }
