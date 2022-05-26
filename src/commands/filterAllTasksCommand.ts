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

import { commands, TreeView, window } from "vscode";
import { CICSCombinedTaskTree } from "../trees/CICSCombinedTaskTree";
import { CICSTree } from "../trees/CICSTree";
import { getPatternFromFilter } from "../utils/filterUtils";
import { PersistentStorage } from "../utils/PersistentStorage";

export function getFilterAllTasksCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.filterAllTasks",
    async (node) => {
      const selection = treeview.selection;
      let chosenNode;
      if (node) {
        chosenNode = node;
      } else if (selection[selection.length-1] && selection[selection.length-1] instanceof CICSCombinedTaskTree) {
        chosenNode = selection[selection.length-1];
      } else { 
        window.showErrorMessage("No CICS 'All Tasks' tree selected");
        return;
      }
      const persistentStorage = new PersistentStorage("zowe.cics.persistent");
      const pattern = await getPatternFromFilter("Transaction ID", persistentStorage.getTransactionSearchHistory());
      if (!pattern) {
        return;
      }
      await persistentStorage.addTransactionSearchHistory(pattern!);
      chosenNode.setFilter(pattern!);
      await chosenNode.loadContents(tree);
      tree._onDidChangeTreeData.fire(undefined);
    }
  );
}
