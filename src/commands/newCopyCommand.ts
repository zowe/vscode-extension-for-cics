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

import { programNewcopy } from "@zowe/cics-for-zowe-cli";
import { commands, TreeView, window } from "vscode";
import { CICSRegionTree } from "../trees/CICSRegionTree";
import { CICSTree } from "../trees/CICSTree";

export function getNewCopyCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.newCopyProgram",
    async (clickedNode) => {
      if (clickedNode) {
        try {
          let selectedNodes = treeview.selection;
          let parentRegions : CICSRegionTree[] = [];

          for (let node of selectedNodes) {
            try {
              const response = await programNewcopy(
                node.parentRegion.parentSession.session,
                {
                  name: node.program.program,
                  regionName: node.parentRegion.label,
                  cicsPlex: node.parentRegion.parentPlex ? node.parentRegion.parentPlex.plexName : undefined,
                }
              );
              window.showInformationMessage(
                `New Copy Count for ${node.program.program} : ${response.response.records.cicsprogram.newcopycnt}`
              );
              
              if(!parentRegions.includes(node.parentRegion)){
                parentRegions.push(node.parentRegion);
              }
            } catch(err){
              window.showErrorMessage(err);
            }
               
          }

          for (const parentRegion of parentRegions){
            const programTree = parentRegion.children!.filter((child: any) => child.contextValue.includes("cicstreeprogram."))[0];
            await programTree.loadContents();
          }
          tree._onDidChangeTreeData.fire(undefined);

        } catch (err) {
          window.showErrorMessage(err);
        }
      } else {
        window.showErrorMessage("No CICS program selected");
      }
    }
  );
}
