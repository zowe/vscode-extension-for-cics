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
import { commands, window } from "vscode";
import { CICSTreeDataProvider } from "../trees/treeProvider";

export function getNewCopyCommand(tree: CICSTreeDataProvider) {
  return commands.registerCommand(
    "cics-extension-for-zowe.newCopyProgram",
    async (node) => {
      if (node) {
        window.showInformationMessage(
          `New Copy Requested for program ${node.label}`
        );
        try {
          const response = await programNewcopy(
            node.parentRegion.parentSession.session,
            {
              name: node.label,
              regionName: node.parentRegion.label,
              cicsPlex: node.parentRegion.parentSession.cicsPlex,
            }
          );
          window.showInformationMessage(
            `New Copy Count for ${node.label} = ${response.response.records.cicsprogram.newcopycnt}`
          );
          // tree.refresh();
        } catch (err) {
          window.showErrorMessage(err);
        }
      } else {
        window.showErrorMessage("No CICS program selected");
      }
    }
  );
}
