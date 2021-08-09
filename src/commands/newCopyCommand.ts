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
import { commands, ProgressLocation, TreeView, window } from "vscode";
import { CICSRegionTree } from "../trees/CICSRegionTree";
import { CICSTree } from "../trees/CICSTree";

export function getNewCopyCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.newCopyProgram",
    async (clickedNode) => {
      if (clickedNode) {
        try {
          let selectedNodes = treeview.selection;
          let parentRegions: CICSRegionTree[] = [];

          window.withProgress({
            title: 'New Copy',
            location: ProgressLocation.Notification,
            cancellable: true
          }, async (progress, token) => {
            token.onCancellationRequested(() => {
              console.log("Cancelling the New Copy");
            });
            for (const index in selectedNodes) {
              progress.report({
                message: `New Copying ${parseInt(index) + 1} of ${selectedNodes.length}`,
                increment: (parseInt(index) / selectedNodes.length) * 100,
              });
              try {

                const currentNode = selectedNodes[parseInt(index)];

                await programNewcopy(
                  currentNode.parentRegion.parentSession.session,
                  {
                    name: currentNode.program.program,
                    regionName: currentNode.parentRegion.label,
                    cicsPlex: currentNode.parentRegion.parentPlex ? currentNode.parentRegion.parentPlex.plexName : undefined,
                  }
                );
                if (!parentRegions.includes(currentNode.parentRegion)) {
                  parentRegions.push(currentNode.parentRegion);
                }
              } catch (err) {
                window.showErrorMessage(err);
              }
            }
            for (const parentRegion of parentRegions) {
              const programTree = parentRegion.children!.filter((child: any) => child.contextValue.includes("cicstreeprogram."))[0];
              await programTree.loadContents();
            }
            tree._onDidChangeTreeData.fire(undefined);
          });
        } catch (err) {
          window.showErrorMessage(err);
        }
      } else {
        window.showErrorMessage("No CICS program selected");
      }
    }
  );
}
