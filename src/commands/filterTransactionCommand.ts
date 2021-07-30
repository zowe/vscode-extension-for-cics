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
import { PersistentFilters } from "../utils/PersistentStorage";

export function getFilterTransactionCommand(tree: CICSTree) {
  return commands.registerCommand(
    "cics-extension-for-zowe.filterTransactions",
    async (node) => {
      if (node) {

        const persistentFilters = new PersistentFilters("Zowe.CICS.Persistent");
        let pattern: string;
        const desc = new FilterDescriptor("\uFF0B Create New Transaction Filter");
        const items = persistentFilters.getTransactionSearchHistory().map(loadedFilter => {
          return { label: loadedFilter };
        });
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
            pattern = quickpick.value;
          }
        } else {
          pattern = choice.label;
        }
        await persistentFilters.addTransactionSearchHistory(pattern!);
        node.setFilter(pattern!);
        await node.loadContents();
        tree._onDidChangeTreeData.fire(undefined);
      }
    }
  );
}
