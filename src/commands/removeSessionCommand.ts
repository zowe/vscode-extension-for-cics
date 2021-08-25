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
import { CICSTree } from "../trees/CICSTree";

export function getRemoveSessionCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.removeSession",
    async (node) => {
      if (node) {
          const selectedNodes = treeview.selection.filter((selectedNode) => selectedNode !== node);
          const allSelectedNodes = [node, ...selectedNodes];
          window.withProgress({
            title: 'Hide Profile',
            location: ProgressLocation.Notification,
            cancellable: true
          }, async (progress, token) => {
            token.onCancellationRequested(() => {
              console.log("Cancelling the hide command");
            });
            for (const index in allSelectedNodes) {
              progress.report({
                message: `Hiding ${parseInt(index) + 1} of ${allSelectedNodes.length}`,
                increment: (parseInt(index) / allSelectedNodes.length) * 100,
              });
              try {
                const currentNode = allSelectedNodes[parseInt(index)];

                await tree.removeSession(currentNode);

              } catch(err){
                window.showErrorMessage(err);
              }
            }
          });
      } else {
        window.showErrorMessage("No profile selected to remove");
      }
    }
  );
}