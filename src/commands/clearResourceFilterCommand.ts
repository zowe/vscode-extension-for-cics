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
import { CICSLocalFileTree } from "../trees/CICSLocalFileTree";
import { CICSProgramTree } from "../trees/CICSProgramTree";
import { CICSTaskTree } from "../trees/CICSTaskTree";
import { CICSTransactionTree } from "../trees/CICSTransactionTree";
import { CICSDb2TransactionTree } from "../trees/Db2/CICSDb2TransactionTree";
import { CICSDb2TransactionDefinitionTree } from "../trees/Db2/CICSDb2TransactionDefinitionTree";
import { CICSTree } from "../trees/CICSTree";
import { findSelectedNodes } from "../utils/commandUtils";

export function getClearResourceFilterCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.clearFilter",
    async (node) => {
      const allSelectedProgramTreeNodes = findSelectedNodes(treeview, CICSProgramTree, node);
      const allSelectedTransactionTreeNodes = findSelectedNodes(treeview, CICSTransactionTree, node);
      const allSelectedDb2TransactionTreeNodes = findSelectedNodes(treeview, CICSDb2TransactionTree, node);
      const allSelectedDb2TransactionDefinitionTreeNodes = findSelectedNodes(treeview, CICSDb2TransactionDefinitionTree, node);
      const allSelectedLocalFileTreeNodes = findSelectedNodes(treeview, CICSLocalFileTree, node);
      const allSelectedTaskTreeNodes = findSelectedNodes(treeview, CICSTaskTree, node);
      const allSelectedLibraryTreeNodes = findSelectedNodes(treeview, CICSLibraryTree, node);
      const allSelectedNodes = [...allSelectedProgramTreeNodes, ...allSelectedTransactionTreeNodes, ...allSelectedDb2TransactionTreeNodes, ...allSelectedDb2TransactionDefinitionTreeNodes, ...allSelectedLocalFileTreeNodes, ...allSelectedTaskTreeNodes, ...allSelectedLibraryTreeNodes];
      if (!allSelectedNodes || !allSelectedNodes.length) {
        window.showErrorMessage("No CICS resource tree selected");
        return;
      }
      for (const node of allSelectedNodes) {
        node.clearFilter();
        window.withProgress({
          title: 'Loading Resources',
          location: ProgressLocation.Notification,
          cancellable: false
        }, async (_, token) => {
          token.onCancellationRequested(() => {
            console.log("Cancelling the loading of resources");
          });
        await node.loadContents();
        tree._onDidChangeTreeData.fire(undefined);
        });
      }
    }
  );
}
