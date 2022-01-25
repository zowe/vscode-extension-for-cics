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
import { CICSSessionTree } from "../trees/CICSSessionTree";
import { CICSTree } from "../trees/CICSTree";
import { findSelectedNodes } from "../utils/commandUtils";

export function getUpdateSessionCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.updateSession",
    async (node) => {
      const allSelectedNodes = findSelectedNodes(treeview, CICSSessionTree, node);
      if (!allSelectedNodes || !allSelectedNodes.length) {
        window.showErrorMessage("No profile selected to update");
        return;
      }
      for (const sessionTree of allSelectedNodes) {
        try {
          await tree.updateSession(sessionTree);
        } catch (error) {
          window.showErrorMessage(`Something went wrong when updating the profile - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(/(\\n\t|\\n|\\t)/gm," ")}`);
        }
      }
    }
  );
}