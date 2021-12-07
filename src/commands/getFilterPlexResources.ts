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
import { CICSRegionTree } from "../trees/CICSRegionTree";
import { CICSTree } from "../trees/CICSTree";
import { FilterDescriptor, resolveQuickPickHelper } from "../utils/FilterUtils";
import { PersistentStorage } from "../utils/PersistentStorage";
import { isTheia } from "../utils/theiaCheck";

export function getFilterPlexResources(tree: CICSTree) {
  return commands.registerCommand(
    "cics-extension-for-zowe.filterPlexResources",
    async (node) => {
      if (node) {
        const plex = node.getParent();
        const plexProfile = plex.getProfile();
        let resourceToFilter;
        if (plexProfile.profile.regionName && plexProfile.profile.cicsPlex) {
          resourceToFilter = await window.showQuickPick(["Programs", "Local Transactions", "Local Files"]);
        } else {
          resourceToFilter = await window.showQuickPick(["Regions", "Programs", "Local Transactions", "Local Files"]);
        }
        const filterDescriptorText = `\uFF0B Create New ${resourceToFilter} Filter (use a comma to separate multiple patterns e.g. LG*,I*)`;

        const persistentStorage = new PersistentStorage("Zowe.CICS.Persistent");
        let pattern: string;
        const desc = new FilterDescriptor(filterDescriptorText);

        let items;
        if (resourceToFilter === "Programs"){
            items = persistentStorage.getProgramSearchHistory().map(loadedFilter => {
                return { label: loadedFilter };
            });
        } else if(resourceToFilter === "Local Transactions"){
            items = persistentStorage.getTransactionSearchHistory().map(loadedFilter => {
                return { label: loadedFilter };
            });
        } else if (resourceToFilter === "Local Files"){
            items = persistentStorage.getLocalFileSearchHistory().map(loadedFilter => {
                return { label: loadedFilter };
            });
        } else if (resourceToFilter === "Regions") {
            items = persistentStorage.getRegionSearchHistory().map(loadedFilter => {
              return { label: loadedFilter };
            });
        } else {
            window.showInformationMessage("No Selection Made");
            return;
        }
        
        if (isTheia()) {
          const choice = await window.showQuickPick([desc, ...items]);
          if (!choice) {
            window.showInformationMessage("No Selection Made");
            return;
          }

          if (choice === desc) {
            pattern = await window.showInputBox() || "";
            if (!pattern) {
              window.showInformationMessage( "You must enter a pattern.");
              return;
          }
          } else {
            pattern = choice.label;
          }
        } else {
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
              pattern = quickpick.value.replace(/\s/g, '');;
            }
          } else {
            pattern = choice.label.replace(/\s/g, '');;
          }
        }

        if (resourceToFilter === "Programs"){
            await persistentStorage.addProgramSearchHistory(pattern!);
        } else if(resourceToFilter === "Local Transactions"){
            await persistentStorage.addTransactionSearchHistory(pattern!);
        } else if (resourceToFilter === "Local Files"){
            await persistentStorage.addLocalFileSearchHistory(pattern!);
        } else if (resourceToFilter === "Regions"){
            await persistentStorage.addRegionSearchHistory(pattern!);
      }

        node.collapsibleState = TreeItemCollapsibleState.Expanded;

        if (resourceToFilter === "Regions"){
          node.filterRegions(pattern!, tree);
        } else {
          for (const region of node.children){
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
        }
        tree._onDidChangeTreeData.fire(undefined);
      }
    }
  );
}
