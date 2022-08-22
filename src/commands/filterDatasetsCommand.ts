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

import { commands, ProgressLocation, TreeView, window } from "vscode";
import { CICSTree } from "../trees/CICSTree";
import { CICSLibraryTreeItem } from "../trees/treeItems/CICSLibraryTreeItem";
import { getPatternFromFilter } from "../utils/filterUtils";
import { PersistentStorage } from "../utils/PersistentStorage";

export function getFilterDatasetsCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.filterDatasets",
    async (node) => {
      const selection = treeview.selection;
      let chosenNode: CICSLibraryTreeItem;
      if (node) {
        chosenNode = node;
      } else if (selection[selection.length-1] && selection[selection.length-1] instanceof CICSLibraryTreeItem) {
        chosenNode = selection[selection.length-1];
      } else { 
        window.showErrorMessage("No CICS library tree item selected");
        return;
      }
      const persistentStorage = new PersistentStorage("zowe.cics.persistent");
      const pattern = await getPatternFromFilter("Dataset", persistentStorage.getDatasetSearchHistory());
      if (!pattern) {
        return;
      }
      await persistentStorage.addDatasetSearchHistory(pattern!);
      chosenNode.setFilter(pattern!);
      window.withProgress({
        title: 'Loading Datasets here',
        location: ProgressLocation.Notification,
        cancellable: false
      }, async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the loading of datasets");
        });
      await chosenNode.loadContents();
      tree._onDidChangeTreeData.fire(undefined);
      });
    }
  );
}