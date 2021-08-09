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

import { commands, TreeItemCollapsibleState, window } from "vscode";
import { CICSTree } from "../trees/CICSTree";
import { FilterDescriptor, resolveQuickPickHelper } from "../utils/FilterUtils";
import { PersistentFilters } from "../utils/PersistentStorage";

export function getFilterPlexResources(tree: CICSTree) {
  return commands.registerCommand(
    "cics-extension-for-zowe.filterPlexResources",
    async (node) => {
      if (node) {

        const resourceToFilter = await window.showQuickPick(["Programs", "Local Transactions", "Local Files"]);
        const filterDescriptorText = `\uFF0B Create New ${resourceToFilter} Filter`;

        const persistentFilters = new PersistentFilters("Zowe.CICS.Persistent");
        let pattern: string;
        const desc = new FilterDescriptor(filterDescriptorText);

        let items;
        if (resourceToFilter === "Programs"){
            items = persistentFilters.getProgramSearchHistory().map(loadedFilter => {
                return { label: loadedFilter };
            });
        } else if(resourceToFilter === "Local Transactions"){
            items = persistentFilters.getTransactionSearchHistory().map(loadedFilter => {
                return { label: loadedFilter };
            });
        } else if (resourceToFilter === "Local Files"){
            items = persistentFilters.getLocalFileSearchHistory().map(loadedFilter => {
                return { label: loadedFilter };
            });
        } else {
            window.showInformationMessage("No Selection Made");
            return;
        }

        

        const quickpick = window.createQuickPick();
        quickpick.items = [desc, ...items];
        quickpick.placeholder = "Select past filter or create new...";
        quickpick.ignoreFocusOut = true;
        quickpick.show();
        const choice = await resolveQuickPickHelper(quickpick);
        quickpick.hide();
        if (!choice) {
          window.showInformationMessage("No Selection Made");
          return;
        }
        if (choice instanceof FilterDescriptor) {
          if (quickpick.value) {
            pattern = quickpick.value;
          }
        } else {
          pattern = choice.label;
        }

        if (resourceToFilter === "Programs"){
            await persistentFilters.addProgramSearchHistory(pattern!);
        } else if(resourceToFilter === "Local Transactions"){
            await persistentFilters.addTransactionSearchHistory(pattern!);
        } else if (resourceToFilter === "Local Files"){
            await persistentFilters.addLocalFileSearchHistory(pattern!);
        }

        node.collapsibleState = TreeItemCollapsibleState.Expanded;
    
        for (const region of node.children){
          if(region.getIsActive()){
            let treeToFilter;
            if (resourceToFilter === "Programs"){
                treeToFilter = region.children.filter((child: any) => child.contextValue.includes("cicstreeprogram."))[0];
            } else if (resourceToFilter === "Local Transactions"){
                treeToFilter = region.children.filter((child: any) => child.contextValue.includes("cicstransactiontree."))[0];
            } else if (resourceToFilter === "Local Files"){
                treeToFilter = region.children.filter((child: any) => child.contextValue.includes("cicslocalfiletree."))[0];
            }
            treeToFilter.setFilter(pattern!);
            await treeToFilter.loadContents();
            treeToFilter.collapsibleState = TreeItemCollapsibleState.Expanded;
            region.collapsibleState = TreeItemCollapsibleState.Expanded;
          }
        }
        
        tree._onDidChangeTreeData.fire(undefined);
      }
    }
  );
}