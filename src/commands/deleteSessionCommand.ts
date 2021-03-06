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

import { commands, TreeView, window } from "vscode";
import { CICSTree } from "../trees/CICSTree";

export function getDeleteSessionCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.deleteSession",
    async (node) => {
      if (node) {
        const selectedNodes = treeview.selection.filter((selectedNode) => selectedNode !== node);
        await tree.deleteSession([node, ...selectedNodes]);
      } else {
        window.showErrorMessage("No profile selected to delete");
      }
    }
  );
}
