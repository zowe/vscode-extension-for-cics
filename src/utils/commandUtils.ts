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
  let allSelectedNodes = [];
  if (clickedNode) {
    if(selection.includes(clickedNode)){
      allSelectedNodes = [...selection];
    } else{
      //if user right clicks the node other than selected node
      allSelectedNodes = [clickedNode];
    }
    allSelectedNodes = allSelectedNodes.filter((selectedNode) => selectedNode instanceof instanceOf);
  }
  // executed from command palette
  else if (selection.length) {
    allSelectedNodes = selection.filter((node:any) => node && node instanceof instanceOf);
  }
  return allSelectedNodes;
}

/**
 * Split error messages from Zowe CICS plugin's Cmci REST client
 * @param message 
 * @returns 
 */
export function splitCmciErrorMessage(message: any){
    const messageArr = message.split(" ").join("").split("\n");
    let resp;
    let resp2;
    let respAlt;
    let eibfnAlt;
    for (const val of messageArr) {
      const values = val.split(":");
      if (values[0] === "resp"){
        resp = values[1];
      } else if (values[0] === "resp2"){
        resp2 = values[1];
      } else if (values[0] === "resp_alt"){
        respAlt = values[1];
      } else if (values[0] === "eibfn_alt"){
        eibfnAlt = values[1];
      }
    }
    return [resp, resp2, respAlt, eibfnAlt];
}
