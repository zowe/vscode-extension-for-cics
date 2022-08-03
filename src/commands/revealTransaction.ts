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

import { commands, TreeItemCollapsibleState, TreeView, window } from "vscode";
import { CICSCombinedTaskTree } from "../trees/CICSCombinedTaskTree";
import { CICSPlexTree } from "../trees/CICSPlexTree";
import { CICSRegionsContainer } from "../trees/CICSRegionsContainer";
import { CICSRegionTree } from "../trees/CICSRegionTree";
import { CICSTransactionTree } from "../trees/CICSTransactionTree";
import { CICSTree } from "../trees/CICSTree";
import { CICSTaskTreeItem } from "../trees/treeItems/CICSTaskTreeItem";
import { CICSDb2TransactionTreeItem } from "../trees/treeItems/CICSDb2TransactionTreeItem";
import { CICSDb2TransactionDefinitionTreeItem } from "../trees/treeItems/CICSDb2TransactionDefinitionTreeItem";
import { findSelectedNodes } from "../utils/commandUtils";

/**
 * Reveal the associated transaction tree item from a task tree item
 */
export function getRevealTransactionCommand(tree: CICSTree,treeview: TreeView<any>) {
    return commands.registerCommand(
      "cics-extension-for-zowe.revealTransaction",
      async (node) => {
        let allSelectedNodes:any = [];
        switch(node.contextValue.substring(0, node.contextValue.indexOf('.'))){
          case 'cicsdefinitiondb2transaction': {
            allSelectedNodes = findSelectedNodes(treeview, CICSDb2TransactionDefinitionTreeItem, node) as CICSDb2TransactionDefinitionTreeItem[];
            break;
          }
          case 'cicsdb2transaction': {
            allSelectedNodes = findSelectedNodes(treeview, CICSDb2TransactionTreeItem, node) as CICSDb2TransactionTreeItem[];
            break;
          }
          default: {
            allSelectedNodes = findSelectedNodes(treeview, CICSTaskTreeItem, node) as CICSTaskTreeItem[];
          }
        }
        if (!allSelectedNodes || !allSelectedNodes.length) {
          window.showErrorMessage("No CICS Task selected");
          return;
        }
        let resourceFolders;
        if (allSelectedNodes[0].getParent() instanceof CICSCombinedTaskTree) {
          const cicsPlex: CICSPlexTree = allSelectedNodes[0].getParent().getParent();
          const regionsContainer = cicsPlex.getChildren().filter(child => child instanceof CICSRegionsContainer)[0];
          //@ts-ignore
          const regionTree: CICSRegionTree = regionsContainer.getChildren()!.filter(region => region.getRegionName() === allSelectedNodes[0].parentRegion.getRegionName())[0];
          resourceFolders = regionTree.getChildren()!;
        } else {
          resourceFolders = allSelectedNodes[0].parentRegion.contextValue.includes('cicsregion') ? allSelectedNodes[0].parentRegion.getChildren()! : allSelectedNodes[0].parentRegion.parentRegion.getChildren()!;
        }
        let tranids = [];
        for (const item of allSelectedNodes) {

        switch(item.contextValue.substring(0, item.contextValue.indexOf('.'))){
          case 'cicsdefinitiondb2transaction': {
            tranids.push(item.db2definition["transid"]);
            break;
          }
          case 'cicsdb2transaction': {
            tranids.push(item.db2transaction["transid"]);
            break;
          }
          default: {
            tranids.push(item.task["tranid"]);
          }
        }
        }
        // Comma separated filter
        const pattern = tranids.join(", ");
        const localTransactionTree = resourceFolders.filter((child: any) => child instanceof CICSTransactionTree)[0] as CICSTransactionTree;
        localTransactionTree.setFilter(pattern);
        await localTransactionTree.loadContents();
        tree._onDidChangeTreeData.fire(undefined);

        if (allSelectedNodes[0].getParent() instanceof CICSCombinedTaskTree) {
          let nodeToExpand: any = localTransactionTree;
          
          // TODO: Ideal situation would be to do await treeview.reveal(nodeToExpand), however this is resulting in an error,
          // so reveal/highlight parent node instead
          await treeview.reveal(nodeToExpand.getParent());
          tree._onDidChangeTreeData.fire(undefined);

        }
        tree._onDidChangeTreeData.fire(undefined);
      }
    );
  }