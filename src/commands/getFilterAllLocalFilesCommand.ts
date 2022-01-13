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

import { commands } from "vscode";
import { CICSTree } from "../trees/CICSTree";
import { getPatternFromFilter } from "../utils/FilterUtils";
import { PersistentStorage } from "../utils/PersistentStorage";

export function getFilterAllLocalFilesCommand(tree: CICSTree) {
  return commands.registerCommand(
    "cics-extension-for-zowe.filterAllLocalFiles",
    async (node) => {
      if (node) {
        const persistentStorage = new PersistentStorage("Zowe.CICS.Persistent");
        const pattern = await getPatternFromFilter("Local File", persistentStorage.getLocalFileSearchHistory());
        if (!pattern) {
          return;
        }
        await persistentStorage.addLocalFileSearchHistory(pattern!);
        node.setFilter(pattern!);
        await node.loadContents(tree, node.getParent().getGroupName());
        tree._onDidChangeTreeData.fire(undefined);
      }
    }
  );
}
