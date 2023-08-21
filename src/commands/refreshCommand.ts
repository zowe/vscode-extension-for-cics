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

;
import { commands, ProgressLocation, window } from "vscode";
import { CICSTree } from "../trees/CICSTree";
import { ProfileManagement } from "../utils/profileManagement";

export function getRefreshCommand(tree: CICSTree) {
  return commands.registerCommand(
    "cics-extension-for-zowe.refreshTree",
    async () => {
      try {
       await window.withProgress({
          title: 'Refreshing',
          location: ProgressLocation.Notification,
          cancellable: false
        }, async () => {
          await tree.refreshLoadedProfiles();
        });
      } catch (error) {
        console.log(error);
      }
      // window.withProgress({
      //   title: 'Refresh',
      //   location: ProgressLocation.Notification,
      //   cancellable: true
      // }, async (progress, token) => {
      //   token.onCancellationRequested(() => {
      //     console.log("Cancelling the refresh");
      //   });
      //   for (const index in tree.loadedProfiles) {
      //     progress.report({
      //       message: `Refreshing session ${parseInt(index) + 1} of ${tree.loadedProfiles.length}`,
      //       increment: (parseInt(index) / tree.loadedProfiles.length) * 100,
      //     });
      //     let sessionTree = tree.loadedProfiles[parseInt(index)];

      //     sessionTree.collapsibleState = TreeItemCollapsibleState.Collapsed;

      //     for (const sessionChild of sessionTree.children) {
      //       // sessionchhild is plex tree or region tree
      //       if (sessionChild instanceof CICSPlexTree) {
      //         // plex tree -> .children is region trees
      //         for (const region of sessionChild.children) {
      //           for (const child of region.children!) {
      //             if (child instanceof CICSProgramTree) {
      //               await child.loadContents();
      //             }
      //           }
      //         }
      //       } else {
      //         // region tree
      //         for (const child of sessionChild.children!) {
      //           await child.loadContents();
      //         }
      //       }
      //     }
      //   }
      // });
      finally {
        tree._onDidChangeTreeData.fire(undefined);
        window.showInformationMessage("Refreshed");
      }
    }
  );
}
