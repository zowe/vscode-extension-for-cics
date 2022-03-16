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
import { ProfileInfo } from "@zowe/imperative";
import { getSecurityModules, ZoweExplorerApi, ZoweVsCodeExtension } from "@zowe/zowe-explorer-api";
import { commands, ProgressLocation, TreeItemCollapsibleState, window } from "vscode";
import { CICSPlexTree } from "../trees/CICSPlexTree";
import { CICSProgramTree } from "../trees/CICSProgramTree";
import { CICSTree } from "../trees/CICSTree";
import { ProfileManagement } from "../utils/profileManagement";
import { isTheia } from "../utils/workspaceUtils";

export function getRefreshCommand(tree: CICSTree) {
  return commands.registerCommand(
    "cics-extension-for-zowe.refreshTree",
    async () => {
      try {
        const mProfileInfo = new ProfileInfo("zowe", {
          requireKeytar: () => getSecurityModules("keytar", isTheia())!,
        });
        await mProfileInfo.readProfilesFromDisk();
        // const apiRegiser: ZoweExplorerApi.IApiRegisterClient = ProfileManagement.getExplorerApis();
        const apiRegiser: ZoweExplorerApi.IApiRegisterClient = ZoweVsCodeExtension.getZoweExplorerApi("2.0.0-next.202202281000");
        //await ProfileManagement.getProfilesCache().refresh(apiRegiser);
        await ZoweVsCodeExtension.getZoweExplorerApi("2.0.0-next.202202281000").getExplorerExtenderApi().getProfilesCache().refresh(apiRegiser);
        //const allCICSProfiles = await ProfileManagement.getProfilesCache().getProfiles('cics');
        const allCICSProfiles = await ZoweVsCodeExtension.getZoweExplorerApi("2.0.0-next.202202281000").getExplorerExtenderApi().getProfilesCache().getProfiles('cics');
        console.log(allCICSProfiles);
        // await ProfileManagement.getExplorerApis().getExplorerExtenderApi().reloadProfiles();
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
      tree._onDidChangeTreeData.fire(undefined);
      window.showInformationMessage("Refreshed");
    }
  );
}
