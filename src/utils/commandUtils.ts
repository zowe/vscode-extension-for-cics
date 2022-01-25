import { TreeView } from "vscode";

/** 
 * Returns an array of selected nodes in the current treeview.
 * @param treeview - Tree View of the required view
 * @param instanceOf - Instance of the node to include in the selection
 * @param clickedNode - Node that was clicked right before the command was executed
 * @return Array of selected nodes in the treeview.
 */
export function findSelectedNodes(treeview: TreeView<any>, instanceOf:any, clickedNode?:any){
    const selection = treeview.selection;
    let allSelectedNodes: any;
    if (clickedNode) {
        const selectedNodes = selection.filter((selectedNode) => selectedNode !== clickedNode);
        allSelectedNodes = [clickedNode, ...selectedNodes];
    }
    // executed from command palette
    else if (selection.length) {
        allSelectedNodes = selection.filter((node:any) => node && node instanceof instanceOf);
    }
    return allSelectedNodes;
}