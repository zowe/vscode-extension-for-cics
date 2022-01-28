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
import { CICSProgramTree } from "../trees/CICSProgramTree";
import { CICSTree } from "../trees/CICSTree";
import { getPatternFromFilter } from "../utils/FilterUtils";
import { PersistentStorage } from "../utils/PersistentStorage";

export function getFilterProgramsCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.filterPrograms",
    async (node) => {
      const selection = treeview.selection;
      let chosenNode: CICSProgramTree;
      if (node) {
        chosenNode = node;
      } else if (selection[selection.length-1] && selection[selection.length-1] instanceof CICSProgramTree) {
        chosenNode = selection[selection.length-1];
      } else { 
        window.showErrorMessage("No CICS program tree selected");
        return;
      }
      const persistentStorage = new PersistentStorage("Zowe.CICS.Persistent");
      const pattern = await getPatternFromFilter("Program", persistentStorage.getProgramSearchHistory());
      if (!pattern) {
        return;
      }
      await persistentStorage.addProgramSearchHistory(pattern!);
      chosenNode.setFilter(pattern!);
      window.withProgress({
        title: 'Loading Programs',
        location: ProgressLocation.Notification,
        cancellable: false
      }, async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the loading of programs");
        });
      await chosenNode.loadContents();
      tree._onDidChangeTreeData.fire(undefined);
      });
    }
  );
}
