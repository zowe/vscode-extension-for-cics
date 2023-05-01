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

import { IProfAttrs } from "@zowe/imperative";
import { commands, TreeView, window } from "vscode";
import { CICSSessionTree } from "../trees/CICSSessionTree";
import { CICSTree } from "../trees/CICSTree";
import { findSelectedNodes } from "../utils/commandUtils";
import { openConfigFile } from "../utils/workspaceUtils";
import { ProfileManagement } from "../utils/profileManagement";

export function getUpdateSessionCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand("cics-extension-for-zowe.updateSession", async (node) => {
    const allSelectedNodes = findSelectedNodes(treeview, CICSSessionTree, node);
    if (!allSelectedNodes || !allSelectedNodes.length) {
      window.showErrorMessage("No profile selected to update");
      return;
    }
    const configInstance = await ProfileManagement.getConfigInstance();
    if (configInstance.usingTeamConfig) {
      try {
        const currentProfile = await ProfileManagement.getProfilesCache().getProfileFromConfig(allSelectedNodes[allSelectedNodes.length - 1].label);
        if (currentProfile) {
          const filePath = currentProfile.profLoc.osLoc ? currentProfile.profLoc.osLoc[0] : "";
          await openConfigFile(filePath);
        }
      } catch (error) {
        window.showErrorMessage(
          `Something went wrong when updating the profile - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(
            /(\\n\t|\\n|\\t)/gm,
            " "
          )}`
        );
        return;
      }
    } else {
      for (const sessionTree of allSelectedNodes) {
        try {
          await tree.updateSession(sessionTree);
        } catch (error) {
          window.showErrorMessage(
            `Something went wrong when updating the profile - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(
              /(\\n\t|\\n|\\t)/gm,
              " "
            )}`
          );
          return;
        }
      }
    }
  });
}
