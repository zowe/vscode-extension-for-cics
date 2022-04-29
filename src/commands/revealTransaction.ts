import { commands, TreeView, window } from "vscode";
import { CICSTransactionTree } from "../trees/CICSTransactionTree";
import { CICSTree } from "../trees/CICSTree";
import { CICSTaskTreeItem } from "../trees/treeItems/CICSTaskTreeItem";
import { findSelectedNodes } from "../utils/commandUtils";

export function getRevealTransactionCommand(tree: CICSTree,treeview: TreeView<any>) {
    return commands.registerCommand(
      "cics-extension-for-zowe.revealTransaction",
      async (node) => {
        const allSelectedNodes = findSelectedNodes(treeview, CICSTaskTreeItem, node) as CICSTaskTreeItem[];
        if (!allSelectedNodes || !allSelectedNodes.length) {
          window.showErrorMessage("No CICS Task selected");
          return;
        }
        const resourceFolders = allSelectedNodes[0].parentRegion.getChildren()!;
        let tranids = [];
        for (const localTaskTreeItem of allSelectedNodes) {
            const task = localTaskTreeItem.task;
            tranids.push(task["tranid"]);
        }
        const pattern = tranids.join(", ");
        const localTransactionTree = resourceFolders.filter(child => child instanceof CICSTransactionTree)[0] as CICSTransactionTree;
        localTransactionTree.setFilter(pattern);
        await localTransactionTree.loadContents();
        tree._onDidChangeTreeData.fire(undefined);
      }
    );
  }