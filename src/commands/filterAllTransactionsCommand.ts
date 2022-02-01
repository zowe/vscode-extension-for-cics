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
import { CICSCombinedTransactionsTree } from "../trees/CICSCombinedTransactionTree";
import { CICSTree } from "../trees/CICSTree";
import { getPatternFromFilter } from "../utils/FilterUtils";
import { PersistentStorage } from "../utils/PersistentStorage";

export function getFilterAllTransactionsCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.filterAllTransactions",
    async (node) => {
      const selection = treeview.selection;
      let chosenNode;
      if (node) {
        chosenNode = node;
      } else if (selection[selection.length-1] && selection[selection.length-1] instanceof CICSCombinedTransactionsTree) {
        chosenNode = selection[selection.length-1];
      } else { 
        window.showErrorMessage("No CICS 'All Transactions' tree selected");
        return;
      }
      const persistentStorage = new PersistentStorage("Zowe.CICS.Persistent");
      const pattern = await getPatternFromFilter("Transaction", persistentStorage.getTransactionSearchHistory());
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
