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
import { CICSLibraryDatasets } from "../trees/treeItems/CICSLibraryDatasets";
import { CICSLibraryTree } from "../trees/CICSLibraryTree";
import { CICSLocalFileTree } from "../trees/CICSLocalFileTree";
import { CICSProgramTree } from "../trees/CICSProgramTree";
import { CICSTaskTree } from "../trees/CICSTaskTree";
import { CICSTransactionTree } from "../trees/CICSTransactionTree";
import { CICSTree } from "../trees/CICSTree";
import { findSelectedNodes } from "../utils/commandUtils";
import { CICSLibraryTreeItem } from "../trees/treeItems/CICSLibraryTreeItem";
import { CICSTCPIPServiceTree } from "../trees/treeItems/web/CICSTCPIPServiceTree";
import { CICSURIMapTree } from "../trees/treeItems/web/CICSURIMapTree";

export function getClearResourceFilterCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.clearFilter",
    async (node) => {
      const allSelectedProgramTreeNodes = findSelectedNodes(treeview, CICSProgramTree, node);
      const allSelectedTransactionTreeNodes = findSelectedNodes(treeview, CICSTransactionTree, node);
      const allSelectedLocalFileTreeNodes = findSelectedNodes(treeview, CICSLocalFileTree, node);
      const allSelectedTaskTreeNodes = findSelectedNodes(treeview, CICSTaskTree, node);
      const allSelectedLibraryTreeNodes = findSelectedNodes(treeview, CICSLibraryTree, node);
      const allSelectedDatasetTreeNodes = findSelectedNodes(treeview, CICSLibraryTreeItem, node);
      const allSelectedDatasetProgramTreeNodes = findSelectedNodes(treeview, CICSLibraryDatasets, node);
      const allSelectedTCPIPServicesTreeNodes = findSelectedNodes(treeview, CICSTCPIPServiceTree, node);
      const allSelectedURIMapsTreeNodes = findSelectedNodes(treeview, CICSURIMapTree, node);
      const allSelectedNodes = [...allSelectedProgramTreeNodes, ...allSelectedTransactionTreeNodes, ...allSelectedLocalFileTreeNodes, ...allSelectedTaskTreeNodes, ...allSelectedLibraryTreeNodes, ...allSelectedDatasetTreeNodes, ...allSelectedDatasetProgramTreeNodes, ...allSelectedTCPIPServicesTreeNodes, ...allSelectedURIMapsTreeNodes];
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
