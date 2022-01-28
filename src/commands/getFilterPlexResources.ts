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

import { commands, ProgressLocation, TreeItemCollapsibleState, TreeView, window } from "vscode";
import { CICSRegionsContainer } from "../trees/CICSRegionsContainer";
import { CICSRegionTree } from "../trees/CICSRegionTree";
import { CICSTree } from "../trees/CICSTree";
import { getPatternFromFilter } from "../utils/FilterUtils";
import { PersistentStorage } from "../utils/PersistentStorage";

export function getFilterPlexResources(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.filterPlexResources",
    async (node) => {
      const selection = treeview.selection;
      let chosenNode: any;
      if (node) {
        chosenNode = node;
      } else if (selection[selection.length-1] && selection[selection.length-1] instanceof CICSRegionsContainer) {
        chosenNode = selection[selection.length-1];
      } else { 
        window.showErrorMessage("No 'Regions' node selected");
        return;
      }
      const plex = chosenNode.getParent();
      const plexProfile = plex.getProfile();
      let resourceToFilter: any;
      if (plexProfile.profile.regionName && plexProfile.profile.cicsPlex) {
        resourceToFilter = await window.showQuickPick(["Programs", "Local Transactions", "Local Files"]);
      } else {
        resourceToFilter = await window.showQuickPick(["Regions", "Programs", "Local Transactions", "Local Files"]);
      }
      const persistentStorage = new PersistentStorage("Zowe.CICS.Persistent");
      let resourceHistory;
      if (resourceToFilter === "Programs"){
        resourceHistory = persistentStorage.getProgramSearchHistory();
      } else if(resourceToFilter === "Local Transactions"){
        resourceHistory = persistentStorage.getTransactionSearchHistory();
      } else if (resourceToFilter === "Local Files"){
        resourceHistory = persistentStorage.getLocalFileSearchHistory();
      } else if (resourceToFilter === "Regions") {
        resourceHistory = persistentStorage.getRegionSearchHistory();
      } else {
          window.showInformationMessage("No Selection Made");
          return;
      }
      const pattern = await getPatternFromFilter(resourceToFilter.slice(0,-1), resourceHistory);
      if (pattern) {
        if (resourceToFilter === "Programs"){
            await persistentStorage.addProgramSearchHistory(pattern);
        } else if(resourceToFilter === "Local Transactions"){
            await persistentStorage.addTransactionSearchHistory(pattern);
        } else if (resourceToFilter === "Local Files"){
            await persistentStorage.addLocalFileSearchHistory(pattern);
        } else if (resourceToFilter === "Regions"){
            await persistentStorage.addRegionSearchHistory(pattern);
        }

        chosenNode.collapsibleState = TreeItemCollapsibleState.Expanded;

        if (resourceToFilter === "Regions"){
          chosenNode.filterRegions(pattern!, tree);
        } else {
          window.withProgress({
            title: 'Loading Resources',
            location: ProgressLocation.Notification,
            cancellable: true
          }, async (_, token) => {
            token.onCancellationRequested(() => {
              console.log("Cancelling the loading of resources");
            });
          for (const region of chosenNode.children){
            if (region instanceof CICSRegionTree) {
              if (region.getIsActive()) {
                let treeToFilter;
                if (resourceToFilter === "Programs"){
                    treeToFilter = region.children?.filter((child: any) => child.contextValue.includes("cicstreeprogram."))[0];
                } else if (resourceToFilter === "Local Transactions"){
                    treeToFilter = region.children?.filter((child: any) => child.contextValue.includes("cicstreetransaction."))[0];
                } else if (resourceToFilter === "Local Files"){
                    treeToFilter = region.children?.filter((child: any) => child.contextValue.includes("cicstreelocalfile."))[0];
                }
                if (treeToFilter) {
                  treeToFilter.setFilter(pattern!);
                  await treeToFilter.loadContents();
                  treeToFilter.collapsibleState = TreeItemCollapsibleState.Expanded;
                }
                region.collapsibleState = TreeItemCollapsibleState.Expanded;
              }
            }
          }
          tree._onDidChangeTreeData.fire(undefined);
          });
        }
        tree._onDidChangeTreeData.fire(undefined);
      }
  }
  );
}
