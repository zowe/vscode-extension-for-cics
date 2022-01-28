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
import { CICSLocalFileTree } from "../trees/CICSLocalFileTree";
import { CICSTree } from "../trees/CICSTree";
import { getPatternFromFilter } from "../utils/FilterUtils";
import { PersistentStorage } from "../utils/PersistentStorage";

export function getFilterLocalFilesCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.filterLocalFiles",
    async (node) => {
      const selection = treeview.selection;
      let chosenNode: CICSLocalFileTree;
      if (node) {
        chosenNode = node;
      } else if (selection[selection.length-1] && selection[selection.length-1] instanceof CICSLocalFileTree) {
        chosenNode = selection[selection.length-1];
      } else { 
        window.showErrorMessage("No CICS local file tree selected");
        return;
      }
      const persistentStorage = new PersistentStorage("Zowe.CICS.Persistent");
      const pattern = await getPatternFromFilter("Local File", persistentStorage.getLocalFileSearchHistory());
      if (!pattern) {
        return;
      }
      await persistentStorage.addLocalFileSearchHistory(pattern!);
      chosenNode.setFilter(pattern!);
      window.withProgress({
        title: 'Loading Local Files',
        location: ProgressLocation.Notification,
        cancellable: false
      }, async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the loading of local files");
        });
        await chosenNode.loadContents();
        tree._onDidChangeTreeData.fire(undefined);
      });
    }
  );
}
