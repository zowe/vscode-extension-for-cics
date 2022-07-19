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
import { CICSLibraryTree } from "../trees/CICSLibraryTree";
import { CICSTree } from "../trees/CICSTree";
import { getPatternFromFilter } from "../utils/filterUtils";
import { PersistentStorage } from "../utils/PersistentStorage";

export function getFilterLibrariesCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.filterLibraries",
    async (node) => {
      const selection = treeview.selection;
      let chosenNode: CICSLibraryTree;
      if (node) {
        chosenNode = node;
      } else if (selection[selection.length-1] && selection[selection.length-1] instanceof CICSLibraryTree) {
        chosenNode = selection[selection.length-1];
      } else { 
        window.showErrorMessage("No CICS library tree selected");
        return;
      }
      const persistentStorage = new PersistentStorage("zowe.cics.persistent");
      const pattern = await getPatternFromFilter("Library", persistentStorage.getLibrarySearchHistory());
      if (!pattern) {
        return;
      }
      await persistentStorage.addLibrarySearchHistory(pattern!);
      chosenNode.setFilter(pattern!);
      window.withProgress({
        title: 'Loading Libraries',
        location: ProgressLocation.Notification,
        cancellable: false
      }, async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the loading of libraries");
        });
      await chosenNode.loadContents();
      tree._onDidChangeTreeData.fire(undefined);
      });
    }
  );
}