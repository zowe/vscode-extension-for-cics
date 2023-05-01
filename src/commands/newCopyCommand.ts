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

import { programNewcopy } from "@zowe/cics-for-zowe-cli";
import { commands, ProgressLocation, TreeView, window } from "vscode";
import { CICSRegionTree } from "../trees/CICSRegionTree";
import { CICSTree } from "../trees/CICSTree";
import * as https from "https";
import { CICSRegionsContainer } from "../trees/CICSRegionsContainer";
import { CICSProgramTreeItem } from "../trees/treeItems/CICSProgramTreeItem";
import { findSelectedNodes, splitCmciErrorMessage } from "../utils/commandUtils";
import { CICSCombinedProgramTree } from "../trees/CICSCombinedTrees/CICSCombinedProgramTree";

/**
 * Performs new copy on selected CICSProgram nodes.
 * @param tree - tree which contains the node
 * @param treeview - Tree View of current cics tree
 */
export function getNewCopyCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand("cics-extension-for-zowe.newCopyProgram", async (clickedNode) => {
    const allSelectedNodes = findSelectedNodes(treeview, CICSProgramTreeItem, clickedNode);
    if (!allSelectedNodes || !allSelectedNodes.length) {
      await window.showErrorMessage("No CICS program selected");
      return;
    }
    const parentRegions: CICSRegionTree[] = [];
    window.withProgress(
      {
        title: "New Copy",
        location: ProgressLocation.Notification,
        cancellable: true,
      },
      async (progress, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the New Copy");
        });
        for (const index in allSelectedNodes) {
          progress.report({
            message: `New Copying ${parseInt(index) + 1} of ${allSelectedNodes.length}`,
            increment: (parseInt(index) / allSelectedNodes.length) * 100,
          });
          const currentNode = allSelectedNodes[parseInt(index)];

          https.globalAgent.options.rejectUnauthorized = currentNode.parentRegion.parentSession.session.ISession.rejectUnauthorized;

          try {
            await programNewcopy(currentNode.parentRegion.parentSession.session, {
              name: currentNode.program.program,
              regionName: currentNode.parentRegion.label,
              cicsPlex: currentNode.parentRegion.parentPlex ? currentNode.parentRegion.parentPlex.getPlexName() : undefined,
            });
            https.globalAgent.options.rejectUnauthorized = undefined;
            if (!parentRegions.includes(currentNode.parentRegion)) {
              parentRegions.push(currentNode.parentRegion);
            }
          } catch (error) {
            // CMCI new copy error
            https.globalAgent.options.rejectUnauthorized = undefined;
            // @ts-ignore
            if (error.mMessage) {
              // @ts-ignore
              const [_, resp2, respAlt, eibfnAlt] = splitCmciErrorMessage(error.mMessage);
              window.showErrorMessage(
                `Perform NEWCOPY on Program "${
                  allSelectedNodes[parseInt(index)].program.program
                }" failed: EXEC CICS command (${eibfnAlt}) RESP(${respAlt}) RESP2(${resp2})`
              );
            } else {
              window.showErrorMessage(
                `Something went wrong when performing a NEWCOPY - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(
                  /(\\n\t|\\n|\\t)/gm,
                  " "
                )}`
              );
            }
          }
        }
        // Reload contents
        for (const parentRegion of parentRegions) {
          try {
            const programTree = parentRegion.children.filter((child: any) => child.contextValue.includes("cicstreeprogram."))[0];
            // Only load contents if the tree is expanded
            if (programTree.collapsibleState === 2) {
              await programTree.loadContents();
            }
            // if node is in a plex and the plex contains the region container tree
            if (parentRegion.parentPlex && parentRegion.parentPlex.children.some((child) => child instanceof CICSRegionsContainer)) {
              const allProgramsTree = parentRegion.parentPlex.children.filter((child: any) =>
                child.contextValue.includes("cicscombinedprogramtree.")
              )[0] as CICSCombinedProgramTree;
              if (allProgramsTree.collapsibleState === 2 && allProgramsTree.getActiveFilter()) {
                await allProgramsTree.loadContents(tree);
              }
            }
          } catch (error) {
            window.showErrorMessage(
              `Something went wrong when reloading programs - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(
                /(\\n\t|\\n|\\t)/gm,
                " "
              )}`
            );
          }
        }
        tree._onDidChangeTreeData.fire(undefined);
      }
    );
  });
}
