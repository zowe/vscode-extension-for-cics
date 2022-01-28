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
import { ExtensionContext, ProgressLocation, TreeItemCollapsibleState, window } from "vscode";
import { getPhaseInCommand } from "./commands/phaseInCommand";
import {
  getShowProgramAttributesCommand,
  getShowRegionAttributes,
} from "./commands/showAttributesCommand";
import { getFilterProgramsCommand } from "./commands/filterProgramsCommand";
import { ProfileManagement } from "./utils/profileManagement";
import { CICSTree } from "./trees/CICSTree";
import { getShowTransactionAttributesCommand } from "./commands/showTransactionAttributesCommand";
import { getShowLocalFileAttributesCommand } from "./commands/showLocalFileAttributesCommand";
import { getFilterTransactionCommand } from "./commands/filterTransactionCommand";
import { getClearResourceFilterCommand } from "./commands/clearResourceFilterCommand";
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
import { CICSSessionTree } from "./trees/CICSSessionTree";
import { viewMoreCommand } from "./commands/viewMoreCommand";
import { getFilterAllProgramsCommand } from "./commands/filterAllProgramsCommand";
import { getFilterAllTransactionsCommand } from "./commands/filterAllTransactionsCommand";
import { getFilterAllLocalFilesCommand } from "./commands/getFilterAllLocalFilesCommand";
import { getIconPathInResources } from "./utils/getIconPath";
import { plexExpansionHandler } from "./utils/plexExpansionHandler";
import { sessionExpansionHandler } from "./utils/sessionExpansionHandler";
import { regionContainerExpansionHandler } from "./utils/regionContainerExpansionHandler";

export async function activate(context: ExtensionContext) {

  if (ProfileManagement.apiDoesExist()) {
    try {
      await ProfileManagement.registerCICSProfiles();
      ProfileManagement.getProfilesCache().registerCustomProfilesType('cics');
      await ProfileManagement.getExplorerApis().getExplorerExtenderApi().reloadProfiles();
      window.showInformationMessage(
        "Zowe Explorer was modified for the CICS Extension"
      );
    } catch (error) {
      console.log(error);
    }
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
      try {
        await sessionExpansionHandler(node.element, treeDataProv);
      } catch (error) {
        console.log(error);
      }
    } else if (node.element.contextValue.includes("cicsplex.")) {
      try {
        await plexExpansionHandler(node.element, treeDataProv);
      } catch (error) {
        console.log(error);
        const newSessionTree = new CICSSessionTree(
          node.element.getParent().profile,
          getIconPathInResources("profile-disconnected-dark.svg","profile-disconnected-light.svg")
          );
        treeDataProv.loadedProfiles.splice(treeDataProv.getLoadedProfiles().indexOf(node.element.getParent()), 1, newSessionTree);
        treeDataProv._onDidChangeTreeData.fire(undefined);
      }
    } else if (node.element.contextValue.includes("cicsregion.")) {
    } else if (node.element.contextValue.includes("cicstreeprogram.")) {
      window.withProgress({
        title: 'Loading Programs',
        location: ProgressLocation.Notification,
        cancellable: false
      }, async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the loading of programs");
        });
      await node.element.loadContents();
      treeDataProv._onDidChangeTreeData.fire(undefined);
      });
      node.element.collapsibleState = TreeItemCollapsibleState.Expanded;
    } else if (node.element.contextValue.includes("cicstreetransaction.")) {
      window.withProgress({
        title: 'Loading Transactions',
        location: ProgressLocation.Notification,
        cancellable: false
      }, async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the loading of transactions");
        });
        await node.element.loadContents();
        treeDataProv._onDidChangeTreeData.fire(undefined);
      });
      node.element.collapsibleState = TreeItemCollapsibleState.Expanded;
    } else if (node.element.contextValue.includes("cicstreelocalfile.")) {
      window.withProgress({
        title: 'Loading Local Files',
        location: ProgressLocation.Notification,
        cancellable: false
      }, async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the loading of local files");
        });
        await node.element.loadContents();
        treeDataProv._onDidChangeTreeData.fire(undefined);
      });
      node.element.collapsibleState = TreeItemCollapsibleState.Expanded;
    } else if (node.element.contextValue.includes("cicscombinedprogramtree.")) {
      if (node.element.getActiveFilter()) {
        node.element.loadContents(treeDataProv);
      }
      node.element.collapsibleState = TreeItemCollapsibleState.Expanded;
    } else if (node.element.contextValue.includes("cicscombinedtransactiontree.")) {
      if (node.element.getActiveFilter()) {
        node.element.loadContents(treeDataProv);
      }
      node.element.collapsibleState = TreeItemCollapsibleState.Expanded;
    } else if (node.element.contextValue.includes("cicscombinedlocalfiletree.")) {
      if (node.element.getActiveFilter()) {
        node.element.loadContents(treeDataProv);
      }
      node.element.collapsibleState = TreeItemCollapsibleState.Expanded;
    } else if (node.element.contextValue.includes("cicsregionscontainer.")) {
      node.element.iconPath = getIconPathInResources("folder-open-dark.svg", "folder-open-light.svg");
      await regionContainerExpansionHandler(node.element, treeDataProv);
      treeDataProv._onDidChangeTreeData.fire(undefined);
    }
  });

  const setIconClosed = (node: any) => {
    node.element.iconPath = getIconPathInResources("folder-closed-dark.svg", "folder-closed-light.svg");
    treeDataProv._onDidChangeTreeData.fire(undefined);
  };

  treeview.onDidCollapseElement(async (node) => {
    if (node.element.contextValue.includes("cicsregionscontainer.")) {
      setIconClosed(node);
    } else if (node.element.contextValue.includes("cicscombinedprogramtree.")) {
      setIconClosed(node);
    } else if (node.element.contextValue.includes("cicscombinedtransactiontree.")) {
      setIconClosed(node);
    } else if (node.element.contextValue.includes("cicscombinedlocalfiletree.")) {
      setIconClosed(node);
    } else if (node.element.contextValue.includes("cicstreeprogram.")) {
      setIconClosed(node);
    } else if (node.element.contextValue.includes("cicstreetransaction.")) {
      setIconClosed(node);
    } else if (node.element.contextValue.includes("cicstreelocalfile.")) {
      setIconClosed(node);
    }
    node.element.collapsibleState = TreeItemCollapsibleState.Collapsed;
  }
  );

  context.subscriptions.push(
    getAddSessionCommand(treeDataProv),
    getRemoveSessionCommand(treeDataProv, treeview),
    getUpdateSessionCommand(treeDataProv, treeview),
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

    getShowRegionAttributes(treeview),
    getShowProgramAttributesCommand(treeview),
    getShowTransactionAttributesCommand(treeview),
    getShowLocalFileAttributesCommand(treeview),

    getFilterProgramsCommand(treeDataProv, treeview),
    getFilterTransactionCommand(treeDataProv, treeview),
    getFilterLocalFilesCommand(treeDataProv, treeview),
    getFilterAllProgramsCommand(treeDataProv, treeview),
    getFilterAllTransactionsCommand(treeDataProv, treeview),
    getFilterAllLocalFilesCommand(treeDataProv, treeview),
    
    getFilterPlexResources(treeDataProv, treeview),

    getClearResourceFilterCommand(treeDataProv, treeview),
    getClearPlexFilterCommand(treeDataProv, treeview),
    
    viewMoreCommand(treeDataProv, treeview)
  );
}

