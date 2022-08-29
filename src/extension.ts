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

import { getDisableProgramCommand } from "./commands/disableCommands/disableProgramCommand";
import { getRemoveSessionCommand } from "./commands/removeSessionCommand";
import { getEnableProgramCommand } from "./commands/enableCommands/enableProgramCommand";
import { getAddSessionCommand } from "./commands/addSessionCommand";
import { getNewCopyCommand } from "./commands/newCopyCommand";
import { ExtensionContext, ProgressLocation, TreeItemCollapsibleState, window } from "vscode";
import { getPhaseInCommand } from "./commands/phaseInCommand";
import {
  getShowProgramAttributesCommand,
  getShowLibraryAttributesCommand,
  getShowLibraryDatasetsAttributesCommand,
  getShowTCPIPServiceAttributesCommand,
  getShowURIMapAttributesCommand,
  getShowRegionAttributes,
  getShowTransactionAttributesCommand,
  getShowLocalFileAttributesCommand,
  getShowTaskAttributesCommand
} from "./commands/showAttributesCommand";
import { getShowRegionSITParametersCommand} from "./commands/showParameterCommand";
import { getFilterProgramsCommand, getFilterDatasetProgramsCommand, getFilterLibrariesCommand, getFilterDatasetsCommand, getFilterTransactionCommand, getFilterLocalFilesCommand, getFilterTasksCommand } from "./commands/filterResourceCommands";
import { ProfileManagement } from "./utils/profileManagement";
import { CICSTree } from "./trees/CICSTree";
import { getClearResourceFilterCommand } from "./commands/clearResourceFilterCommand";
import { getFilterPlexResources } from "./commands/getFilterPlexResources";
import { getClearPlexFilterCommand } from "./commands/clearPlexFilterCommand";
import { getRefreshCommand } from "./commands/refreshCommand";
import { getUpdateSessionCommand } from "./commands/updateSessionCommand";
import { getDeleteSessionCommand } from "./commands/deleteSessionCommand";
import { getDisableTransactionCommand } from "./commands/disableCommands/disableTransactionCommand";
import { getEnableTransactionCommand } from "./commands/enableCommands/enableTransactionCommand";
import { getEnableLocalFileCommand } from "./commands/enableCommands/enableLocalFileCommand";
import { getDisableLocalFileCommand } from "./commands/disableCommands/disableLocalFileCommand";
import { getCloseLocalFileCommand } from "./commands/closeLocalFileCommand";
import { getOpenLocalFileCommand } from "./commands/openLocalFileCommand";
import { CICSSessionTree } from "./trees/CICSSessionTree";
import { viewMoreCommand } from "./commands/viewMoreCommand";
import { getFilterAllProgramsCommand } from "./commands/filterAllResourceCommand";
import { getFilterAllLibrariesCommand, getFilterAllTransactionsCommand, getFilterAllLocalFilesCommand, getFilterAllURIMapsCommand, getFilterAllTCPIPServicesCommand, getFilterAllTasksCommand} from "./commands/filterAllResourceCommand";
import { getIconPathInResources, setIconClosed } from "./utils/profileUtils";
import { plexExpansionHandler } from "./utils/expansionHandler";
import { sessionExpansionHandler } from "./utils/expansionHandler";
import { regionContainerExpansionHandler } from "./utils/expansionHandler";
import { getZoweExplorerVersion, isTheia } from "./utils/workspaceUtils";
import { CredentialManagerFactory, Logger } from "@zowe/imperative";
import { KeytarApi } from "@zowe/zowe-explorer-api";
import { getInquireTransactionCommand } from "./commands/inquireTransaction";
import { getPurgeTaskCommand } from "./commands/purgeTaskCommand";
import { getInquireProgramCommand } from "./commands/inquireProgram";

/**
 * Initialises extension
 * @param context 
 * @returns 
 */
export async function activate(context: ExtensionContext) {
  const log = Logger.getAppLogger();
  const keytarApi = new KeytarApi(log);
  await keytarApi.activateKeytar(CredentialManagerFactory.initialized,isTheia());
  const zeVersion = getZoweExplorerVersion();
  if (!zeVersion){
    window.showErrorMessage("Zowe Explorer was not found: Please ensure Zowe Explorer v2.0.0 or higher is installed");
    return;
  } else if (zeVersion[0] !== "2"){
    window.showErrorMessage(`Current version of Zowe Explorer is ${zeVersion}. Please ensure Zowe Explorer v2.0.0 or higher is installed`);
    return;
  }
  if (ProfileManagement.apiDoesExist()) {
    try {
      // Register 'cics' profiles as a ZE extender
      await ProfileManagement.registerCICSProfiles();
      ProfileManagement.getProfilesCache().registerCustomProfilesType('cics');
      await ProfileManagement.getExplorerApis().getExplorerExtenderApi().reloadProfiles();
      window.showInformationMessage(
        "Zowe Explorer was modified for the CICS Extension."
      );
    } catch (error) {
      console.log(error);
      window.showErrorMessage("Zowe Explorer for IBM CICS was not initiliaized correctly");
      return;
    }
  } else {
    window.showErrorMessage("Zowe Explorer was not found: either it is not installed or you are using an older version without extensibility API. Please ensure Zowe Explorer v2.0.0-next.202202221200 or higher is installed");
    return;
  }

  const treeDataProv = new CICSTree();
  const treeview = window
    .createTreeView("cics-view", {
      treeDataProvider: treeDataProv,
      showCollapseAll: true,
      canSelectMany: true
    });

  treeview.onDidExpandElement(async (node) => {
    // Profile node expanded
    if (node.element.contextValue.includes("cicssession.")) {
      try {
        await sessionExpansionHandler(node.element, treeDataProv);
      } catch (error) {
        console.log(error);
      }
    // Plex node expanded
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
    // Region node expanded
    } else if (node.element.contextValue.includes("cicsregion.")) {

    // Web folder node expanded
    } else if (node.element.contextValue.includes("cicstreeweb.")) {
      window.withProgress({
        title: 'Loading Resources',
        location: ProgressLocation.Notification,
        cancellable: false
      }, async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the loading of resources");
        });
      await node.element.loadContents();
      treeDataProv._onDidChangeTreeData.fire(undefined);
      });
      node.element.collapsibleState = TreeItemCollapsibleState.Expanded;
      // Programs folder node expanded
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

    // Transaction folder node expanded
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

    // Local file folder node expanded
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

    // Task folder node expanded
    } else if (node.element.contextValue.includes("cicstreetask.")) {
      window.withProgress({
        title: 'Loading Tasks',
        location: ProgressLocation.Notification,
        cancellable: false
      }, async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the loading of tasks");
        });
        await node.element.loadContents();
        treeDataProv._onDidChangeTreeData.fire(undefined);
      });
      node.element.collapsibleState = TreeItemCollapsibleState.Expanded;

    // Library folder node expanded
    } else if (node.element.contextValue.includes("cicstreelibrary.")) {
      window.withProgress({
        title: 'Loading Libraries',
        location: ProgressLocation.Notification,
        cancellable: false
      }, async () => {
        await node.element.loadContents();
        treeDataProv._onDidChangeTreeData.fire(undefined);
      });
      node.element.collapsibleState = TreeItemCollapsibleState.Expanded;

    // Library tree item node expanded to view datasets
    } 
    else if (node.element.contextValue.includes("cicslibrary.")) {
      window.withProgress({
        title: 'Loading Datasets',
        location: ProgressLocation.Notification,
        cancellable: false
      }, async () => {
        await node.element.loadContents();
        treeDataProv._onDidChangeTreeData.fire(undefined);
      });
      node.element.collapsibleState = TreeItemCollapsibleState.Expanded;

    // Dataset node expanded 
    } else if (node.element.contextValue.includes("cicsdatasets.")) {
      window.withProgress({
        title: 'Loading Programs',
        location: ProgressLocation.Notification,
        cancellable: false
      }, async () => {
        await node.element.loadContents();
        treeDataProv._onDidChangeTreeData.fire(undefined);
      });
      node.element.collapsibleState = TreeItemCollapsibleState.Expanded;

    // TCPIP folder node expanded
    } else if (node.element.contextValue.includes("cicstreetcpips.")) {
      window.withProgress({
        title: 'Loading TCPIP Services',
        location: ProgressLocation.Notification,
        cancellable: false
      }, async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the loading of TCPIP services");
        });
      await node.element.loadContents();
      treeDataProv._onDidChangeTreeData.fire(undefined);
      });
      node.element.collapsibleState = TreeItemCollapsibleState.Expanded;

    // URIMap folder node expanded
    } else if (node.element.contextValue.includes("cicstreeurimap.")) {
      window.withProgress({
        title: 'Loading URIMaps',
        location: ProgressLocation.Notification,
        cancellable: false
      }, async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the loading of URIMaps");
        });
      await node.element.loadContents();
      treeDataProv._onDidChangeTreeData.fire(undefined);
      });
      node.element.collapsibleState = TreeItemCollapsibleState.Expanded;

    // All programs folder node expanded
    } else if (node.element.contextValue.includes("cicscombinedprogramtree.")) {
      // Children only loaded if filter has been applied
      if (node.element.getActiveFilter()) {
        await node.element.loadContents(treeDataProv);
      }
      node.element.collapsibleState = TreeItemCollapsibleState.Expanded;

    // All transactions folder node expanded
    } else if (node.element.contextValue.includes("cicscombinedtransactiontree.")) {
      if (node.element.getActiveFilter()) {
        await node.element.loadContents(treeDataProv);
      }
      node.element.collapsibleState = TreeItemCollapsibleState.Expanded;

    // All local files folder node expanded
    } else if (node.element.contextValue.includes("cicscombinedlocalfiletree.")) {
      if (node.element.getActiveFilter()) {
        await node.element.loadContents(treeDataProv);
      }
      node.element.collapsibleState = TreeItemCollapsibleState.Expanded;

    // All tasks folder node expanded
    } else if (node.element.contextValue.includes("cicscombinedtasktree.")) {
      if (node.element.getActiveFilter()) {
        await node.element.loadContents(treeDataProv);
      }
      node.element.collapsibleState = TreeItemCollapsibleState.Expanded;
    }

    // All libraries folder node expanded
      else if (node.element.contextValue.includes("cicscombinedlibrarytree.")) {
        if (node.element.getActiveFilter()) {
          await node.element.loadContents(treeDataProv);
        }
        node.element.collapsibleState = TreeItemCollapsibleState.Expanded;
    } 

    // All TCPIP Services node expanded 
      else if (node.element.contextValue.includes("cicscombinedtcpipstree.")) {
      if (node.element.getActiveFilter()) {
        await node.element.loadContents(treeDataProv);
      }
      node.element.collapsibleState = TreeItemCollapsibleState.Expanded;
    }  
    
    // All URI Maps node expanded 
    else if (node.element.contextValue.includes("cicscombinedurimapstree.")) {
    if (node.element.getActiveFilter()) {
      await node.element.loadContents(treeDataProv);
    }
    node.element.collapsibleState = TreeItemCollapsibleState.Expanded;

    // Regions container folder node expanded
    } else if (node.element.contextValue.includes("cicsregionscontainer.")) {
      node.element.iconPath = getIconPathInResources("folder-open-dark.svg", "folder-open-light.svg");
      await regionContainerExpansionHandler(node.element, treeDataProv);
      treeDataProv._onDidChangeTreeData.fire(undefined);
    }
  });

  treeview.onDidCollapseElement(async (node) => {
    if (node.element.contextValue.includes("cicsregionscontainer.")) {
      setIconClosed(node, treeDataProv);
    } else if (node.element.contextValue.includes("cicscombinedprogramtree.")) {
      setIconClosed(node, treeDataProv);
    } else if (node.element.contextValue.includes("cicscombinedtransactiontree.")) {
      setIconClosed(node, treeDataProv);
    } else if (node.element.contextValue.includes("cicscombinedlocalfiletree.")) {
      setIconClosed(node, treeDataProv);
    } else if (node.element.contextValue.includes("cicscombinedtasktree.")) {
      setIconClosed(node, treeDataProv);
    } else if (node.element.contextValue.includes("cicscombinedlibrarytree.")) {
      setIconClosed(node, treeDataProv);
    } else if (node.element.contextValue.includes("cicscombinedtcpipstree.")) {
      setIconClosed(node, treeDataProv);
    } else if (node.element.contextValue.includes("cicscombinedurimapstree.")) {
      setIconClosed(node, treeDataProv);
    } else if (node.element.contextValue.includes("cicstreeprogram.")) {
      setIconClosed(node, treeDataProv);
    } else if (node.element.contextValue.includes("cicstreetransaction.")) {
      setIconClosed(node, treeDataProv);
    } else if (node.element.contextValue.includes("cicstreelocalfile.")) {
      setIconClosed(node, treeDataProv);
    } else if (node.element.contextValue.includes("cicstreetask.")) {
      setIconClosed(node, treeDataProv);
    } else if (node.element.contextValue.includes("cicstreelibrary.")) {
      setIconClosed(node, treeDataProv);
    } else if (node.element.contextValue.includes("cicslibrary.")) {
      setIconClosed(node, treeDataProv);
    } else if (node.element.contextValue.includes("cicstreeweb.")) {
      setIconClosed(node, treeDataProv);
    } else if (node.element.contextValue.includes("cicstreetcpips.")) {
      setIconClosed(node, treeDataProv);
    } else if (node.element.contextValue.includes("cicstreeurimap.")) {
      setIconClosed(node, treeDataProv);
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

    getPurgeTaskCommand(treeDataProv, treeview),

    getShowRegionAttributes(treeview),
    getShowProgramAttributesCommand(treeview),
    getShowLibraryAttributesCommand(treeview),
    getShowLibraryDatasetsAttributesCommand(treeview),
    getShowTCPIPServiceAttributesCommand(treeview),
    getShowURIMapAttributesCommand(treeview),
    getShowTransactionAttributesCommand(treeview),
    getShowLocalFileAttributesCommand(treeview),
    getShowTaskAttributesCommand(treeview),

    getShowRegionSITParametersCommand(treeview),
    
    getFilterProgramsCommand(treeDataProv, treeview),
    getFilterDatasetProgramsCommand(treeDataProv, treeview),
    getFilterLibrariesCommand(treeDataProv, treeview),
    getFilterDatasetsCommand(treeDataProv, treeview),
    getFilterTransactionCommand(treeDataProv, treeview),
    getFilterLocalFilesCommand(treeDataProv, treeview),
    getFilterTasksCommand(treeDataProv, treeview),
    getFilterAllProgramsCommand(treeDataProv, treeview),
    getFilterAllLibrariesCommand(treeDataProv, treeview),
    getFilterAllTransactionsCommand(treeDataProv, treeview),
    getFilterAllLocalFilesCommand(treeDataProv, treeview),
    getFilterAllTasksCommand(treeDataProv, treeview),
    getFilterAllURIMapsCommand(treeDataProv, treeview),
    getFilterAllTCPIPServicesCommand(treeDataProv, treeview),
    
    getFilterPlexResources(treeDataProv, treeview),

    getClearResourceFilterCommand(treeDataProv, treeview),
    getClearPlexFilterCommand(treeDataProv, treeview),
    
    viewMoreCommand(treeDataProv, treeview),

    getInquireTransactionCommand(treeDataProv, treeview),
    getInquireProgramCommand(treeDataProv, treeview)
  );
}

