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

export function getClearPlexFilterCommand(tree: CICSTree) {
  return commands.registerCommand(
    "cics-extension-for-zowe.clearPlexFilter",
    async (node) => {
      if (node) {

        const resourceToClear = await window.showQuickPick(["Programs", "Local Transactions", "Local Files", "All"]);

        for (const region of node.children){
          let treeToClear;
          if (resourceToClear === "Programs"){
              treeToClear = region.children.filter((child: any) => child.contextValue.includes("cicstreeprogram."))[0];
              treeToClear.clearFilter();
              await treeToClear.loadContents();
          } else if (resourceToClear === "Local Transactions"){
              treeToClear = region.children.filter((child: any) => child.contextValue.includes("cicstransactiontree."))[0];
              treeToClear.clearFilter();
              await treeToClear.loadContents();
          } else if (resourceToClear === "Local Files"){
              treeToClear = region.children.filter((child: any) => child.contextValue.includes("cicslocalfiletree."))[0];
              treeToClear.clearFilter();
              await treeToClear.loadContents();
          } else if (resourceToClear === "All"){
            for (const child of region.children){
              child.clearFilter();
              await child.loadContents();
            }
          }
          
      }

        tree._onDidChangeTreeData.fire(undefined);

      } else {
        window.showErrorMessage("No CICS plex selected");
      }
    }
  );
}
