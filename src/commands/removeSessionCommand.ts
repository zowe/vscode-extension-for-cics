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
import { CICSSessionTree } from "../trees/CICSSessionTree";
import { CICSTree } from "../trees/CICSTree";
import { findSelectedNodes } from "../utils/commandUtils";

export function getRemoveSessionCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.removeSession",
    async (node) => {
      const allSelectedNodes = findSelectedNodes(treeview, CICSSessionTree, node);
      if (!allSelectedNodes || !allSelectedNodes.length) {
        window.showErrorMessage("No profile selected to remove");
        return;
      }
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

          } catch (error) {
            window.showErrorMessage(`Something went wrong when hiding the profile - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(/(\\n\t|\\n|\\t)/gm," ")}`);
          }
        }
      });
    }
  );
}