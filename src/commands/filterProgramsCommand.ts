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
import { FilterDescriptor, resolveQuickPickHelper } from "../utils/FilterUtils";
import { PersistentStorage } from "../utils/PersistentStorage";
import { isTheia } from "../utils/theiaCheck";

export function getFilterProgramsCommand(tree: CICSTree) {
  return commands.registerCommand(
    "cics-extension-for-zowe.filterPrograms",
    async (node) => {
      if (node) {
        const persistentStorage = new PersistentStorage("Zowe.CICS.Persistent");
        let pattern: string;
        const desc = new FilterDescriptor("\uFF0B Create New Program Filter (use a comma to separate multiple patterns e.g. LG*,I*)");
        const items = persistentStorage.getProgramSearchHistory().map(loadedFilter => {
          return { label: loadedFilter };
        });

        if (isTheia()) {
          const choice = await window.showQuickPick([desc, ...items]);
          if (!choice) {
            window.showInformationMessage("No Selection Made");
            return;
          }

          if (choice === desc) {
            pattern = await window.showInputBox() || "";
            if (!pattern) {
              window.showInformationMessage( "You must enter a pattern.");
              return;
          }
          } else {
            pattern = choice.label;
          }
        } else {
          const quickpick = window.createQuickPick();
          quickpick.items = [desc, ...items];
          quickpick.placeholder = "Select past filter or create new...";
          quickpick.ignoreFocusOut = true;
          quickpick.show();
          const choice = await resolveQuickPickHelper(quickpick);
          quickpick.hide();
          if (!choice) {
            window.showInformationMessage("No Selection Made");
            return;
          }
          if (choice instanceof FilterDescriptor) {
            if (quickpick.value) {
              pattern = quickpick.value.replace(/\s/g, '');
            }
          } else {
            pattern = choice.label.replace(/\s/g, '');
          }
        }
        await persistentStorage.addProgramSearchHistory(pattern!);
        node.setFilter(pattern!);
        await node.loadContents();
        tree._onDidChangeTreeData.fire(undefined);
      }
    }
  );
}
