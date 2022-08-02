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
import { CICSDb2TransactionTree } from "../trees/Db2/CICSDb2TransactionTree";
import { CICSTree } from "../trees/CICSTree";
import { getPatternFromFilter } from "../utils/filterUtils";
import { PersistentStorage } from "../utils/PersistentStorage";

export function getFilterDb2TransactionCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.filterDb2Transactions",
    async (node) => {
      const selection = treeview.selection;
      let chosenNode: CICSDb2TransactionTree;
      if (node) {
        chosenNode = node;
      } else if (selection[selection.length-1] && selection[selection.length-1] instanceof CICSDb2TransactionTree) {
        chosenNode = selection[selection.length-1];
      } else { 
        window.showErrorMessage("No CICS db2 transaction tree selected");
        return;
      }
      const persistentStorage = new PersistentStorage("zowe.cics.persistent");
      //do it for DB2
      const pattern = await getPatternFromFilter("Db2 Transaction", persistentStorage.getDb2TransactionSearchHistory());
      if (!pattern) {
        return;
      }
      //Do it for Db2
      await persistentStorage.addDb2TransactionSearchHistory(pattern!);
      chosenNode.setFilter(pattern!);
      window.withProgress({
        title: 'Loading Db2 Transactions',
        location: ProgressLocation.Notification,
        cancellable: false
      }, async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the loading of db2 transactions");
        });
        await chosenNode.loadContents();
        tree._onDidChangeTreeData.fire(undefined);
      });
    }
  );
}
