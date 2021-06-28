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

import { CICSTreeDataProvider } from "../trees/treeProvider";
import { commands, window } from "vscode";
import { CICSProgramTreeItem } from "../trees/CICSProgramTree";

export function getFilterProgramsCommand(tree: CICSTreeDataProvider) {
  return commands.registerCommand(
    "cics-extension-for-zowe.filterPrograms",
    async (node) => {
      if (node) {
        const filter = await window.showInputBox({
          prompt: "Input a string you want the resulting programs to contain.",
          ignoreFocusOut: true,
        });

        const regex = filter ? new RegExp(filter.toUpperCase()) : undefined;

        node.children = [];

        await tree.loadPrograms(node);

        node.children = node.children.filter((program: CICSProgramTreeItem) => {
          if (!regex) {
            return true;
          }
          return regex.test(program!.label!);
        });
        tree._onDidChangeTreeData.fire(undefined);
      }
    }
  );
}
function program(program: any) {
  throw new Error("Function not implemented.");
}
