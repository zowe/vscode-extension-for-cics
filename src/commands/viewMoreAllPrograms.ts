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
import { ViewMore } from "../trees/treeItems/utils/ViewMore";

export function viewMoreCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.viewMore",
    () => {
      const selectedNode = treeview.selection.filter((item) => item instanceof ViewMore)[0];
      selectedNode.parent.addMoreCachedResources(tree);
      tree._onDidChangeTreeData.fire(undefined);
    }
  );
}