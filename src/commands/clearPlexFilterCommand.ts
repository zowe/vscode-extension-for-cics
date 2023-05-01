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
import { CICSRegionsContainer } from "../trees/CICSRegionsContainer";
import { CICSRegionTree } from "../trees/CICSRegionTree";
import { CICSTree } from "../trees/CICSTree";
import { findSelectedNodes } from "../utils/commandUtils";

/**
 * Clear filter for a Regions Container (previously this was available on a plex)
 * @param tree
 * @param treeview
 * @returns
 */
export function getClearPlexFilterCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand("cics-extension-for-zowe.clearPlexFilter", async (node) => {
    const allSelectedNodes = findSelectedNodes(treeview, CICSRegionsContainer, node);
    if (!allSelectedNodes || !allSelectedNodes.length) {
      window.showErrorMessage("No CICSPlex tree selected");
      return;
    }
    for (const selectedNode of allSelectedNodes) {
      const plex = selectedNode.getParent();
      const plexProfile = plex.getProfile();
      let resourceToClear;
      if (plexProfile.profile.regionName && plexProfile.profile.cicsPlex) {
        resourceToClear = await window.showQuickPick(["Programs", "Local Transactions", "Local Files", "Tasks", "Libraries", "All"]);
      } else {
        resourceToClear = await window.showQuickPick(["Regions", "Programs", "Local Transactions", "Local Files", "Tasks", "Libraries", "All"]);
      }
      if (!resourceToClear) {
        window.showInformationMessage("No option selected");
        return;
      }
      if ((resourceToClear === "Regions" || resourceToClear === "All") && !(plexProfile.profile.regionName && plexProfile.profile.cicsPlex)) {
        selectedNode.filterRegions("*", tree);
      }
      if (resourceToClear !== "Regions") {
        for (const region of selectedNode.children) {
          if (region instanceof CICSRegionTree) {
            if (region.getIsActive()) {
              if (region.children) {
                let treeToClear;
                if (resourceToClear === "Programs") {
                  treeToClear = region.children.filter((child: any) => child.contextValue.includes("cicstreeprogram."))[0];
                  treeToClear.clearFilter();
                  await treeToClear.loadContents();
                } else if (resourceToClear === "Local Transactions") {
                  treeToClear = region.children.filter((child: any) => child.contextValue.includes("cicstreetransaction."))[0];
                  treeToClear.clearFilter();
                  await treeToClear.loadContents();
                } else if (resourceToClear === "Local Files") {
                  treeToClear = region.children.filter((child: any) => child.contextValue.includes("cicstreelocalfile."))[0];
                  treeToClear.clearFilter();
                  await treeToClear.loadContents();
                } else if (resourceToClear === "Tasks") {
                  treeToClear = region.children.filter((child: any) => child.contextValue.includes("cicstreetask."))[0];
                  treeToClear.clearFilter();
                  await treeToClear.loadContents();
                } else if (resourceToClear === "Libraries") {
                  treeToClear = region.children.filter((child: any) => child.contextValue.includes("cicstreelibrary."))[0];
                  treeToClear.clearFilter();
                  await treeToClear.loadContents();
                } else if (resourceToClear === "TCPIP Services") {
                  treeToClear = region.children.filter((child: any) => child.contextValue.includes("cicstreetcpips."))[0];
                  treeToClear.clearFilter();
                  await treeToClear.loadContents();
                } else if (resourceToClear === "URI Maps") {
                  treeToClear = region.children.filter((child: any) => child.contextValue.includes("cicstreeurimaps."))[0];
                  treeToClear.clearFilter();
                  await treeToClear.loadContents();
                } else if (resourceToClear === "All") {
                  for (const child of region.children) {
                    child.clearFilter();
                    await child.loadContents();
                  }
                }
              }
            }
          }
          tree._onDidChangeTreeData.fire(undefined);
        }
      }
    }
  });
}
