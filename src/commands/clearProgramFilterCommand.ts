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

import { commands, window } from "vscode";
import { CICSTree } from "../trees/CICSTree";

export function getClearProgramFilterCommand(tree: CICSTree) {
  return commands.registerCommand(
    "cics-extension-for-zowe.clearFilter",
    async (node) => {
      if (node) {
        node.clearFilter();
        await node.loadContents();
        tree._onDidChangeTreeData.fire(undefined);

      } else {
        window.showErrorMessage("No CICS program tree selected");
      }
    }
  );
}
