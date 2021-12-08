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

export function getNewCopyCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.newCopyProgram",
    async (clickedNode) => {
      if (clickedNode) {
        try {
          const selectedNodes = treeview.selection.filter((selectedNode) => selectedNode !== clickedNode);
          const allSelectedNodes = [clickedNode, ...selectedNodes];
          let parentRegions: CICSRegionTree[] = [];

          window.withProgress({
            title: 'New Copy',
            location: ProgressLocation.Notification,
            cancellable: true
          }, async (progress, token) => {
            token.onCancellationRequested(() => {
              console.log("Cancelling the New Copy");
            });
            for (const index in allSelectedNodes) {
              progress.report({
                message: `New Copying ${parseInt(index) + 1} of ${allSelectedNodes.length}`,
                increment: (parseInt(index) / allSelectedNodes.length) * 100,
              });
              try {
                const currentNode = allSelectedNodes[parseInt(index)];

                https.globalAgent.options.rejectUnauthorized = currentNode.parentRegion.parentSession.session.ISession.rejectUnauthorized;

                await programNewcopy(
                  currentNode.parentRegion.parentSession.session,
                  {
                    name: currentNode.program.program,
                    regionName: currentNode.parentRegion.label,
                    cicsPlex: currentNode.parentRegion.parentPlex ? currentNode.parentRegion.parentPlex.getPlexName() : undefined,
                  }
                );
                https.globalAgent.options.rejectUnauthorized = undefined;
                if (!parentRegions.includes(currentNode.parentRegion)) {
                  parentRegions.push(currentNode.parentRegion);
                }
              } catch (err) {
                https.globalAgent.options.rejectUnauthorized = undefined;
                // @ts-ignore
                const mMessageArr = err.mMessage.split(" ").join("").split("\n");
                let resp;
                let resp2;
                let respAlt;
                let eibfnAlt;
                for (const val of mMessageArr) {
                  const values = val.split(":");
                  if (values[0] === "resp"){
                    resp = values[1];
                  } else if (values[0] === "resp2"){
                    resp2 = values[1];
                  } else if (values[0] === "resp_alt"){
                    respAlt = values[1];
                  } else if (values[0] === "eibfn_alt"){
                    eibfnAlt = values[1];
                  }
                }
                window.showErrorMessage(`Perform NEWCOPY on Program "${allSelectedNodes[parseInt(index)].program.program}" failed: EXEC CICS command (${eibfnAlt}) RESP(${respAlt}) RESP2(${resp2})`);
              }
            }
            for (const parentRegion of parentRegions) {
              const programTree = parentRegion.children!.filter((child: any) => child.contextValue.includes("cicstreeprogram."))[0];
              // Only load contents if the tree is expanded
              if (programTree.collapsibleState === 2) {
                await programTree.loadContents();
              }
              // if node is in a plex and the plex contains the region container tree
              if (parentRegion.parentPlex && parentRegion.parentPlex.children.some((child) => child instanceof CICSRegionsContainer)) {
                const allProgramsTree = parentRegion.parentPlex.children!.filter((child: any) => child.contextValue.includes("cicscombinedprogramtree."))[0];
                if (allProgramsTree.collapsibleState === 2) {
                  //@ts-ignore
                  await allProgramsTree.loadContents(tree);
                }
              }
            }
            tree._onDidChangeTreeData.fire(undefined);
          });
        } catch (err) {
          // @ts-ignore
          window.showErrorMessage(err);
        }
      } else {
        window.showErrorMessage("No CICS program selected");
      }
    }
  );
}
