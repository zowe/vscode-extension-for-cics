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

import {
  CicsCmciConstants,
  CicsCmciRestClient,
  ICMCIApiResponse,
} from "@zowe/cics-for-zowe-cli";
import { AbstractSession } from "@zowe/imperative";
import { commands, ProgressLocation, TreeView, window } from "vscode";
import { CICSRegionTree } from "../trees/CICSRegionTree";
import { CICSTree } from "../trees/CICSTree";
import * as https from "https";
import { findSelectedNodes, splitCmciErrorMessage } from "../utils/commandUtils";
import { CICSTaskTreeItem } from "../trees/treeItems/CICSTaskTreeItem";
import { CICSRegionsContainer } from "../trees/CICSRegionsContainer";
import { CICSCombinedTaskTree } from "../trees/CICSCombinedTrees/CICSCombinedTaskTree";

/**
 * Purge a CICS Task and reload the CICS Task tree contents and the combined Task tree contents
 * @param tree 
 * @param treeview 
 * @returns 
 */
export function getPurgeTaskCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.purgeTask",
    async (clickedNode) => {
      const allSelectedNodes = findSelectedNodes(treeview, CICSTaskTreeItem, clickedNode);
      if (!allSelectedNodes || !allSelectedNodes.length) {
        window.showErrorMessage("No CICS task selected");
        return;
      }
      let parentRegions: CICSRegionTree[] = [];
      let purgeType = await window.showInformationMessage(
        `Choose one of the following options for Purge`,
        ...["Purge", "Force Purge"]);
      if (purgeType){
        purgeType =  purgeType.replace(" ","").toUpperCase();

        window.withProgress({
          title: 'Purge',
          location: ProgressLocation.Notification,
          cancellable: true
        }, async (progress, token) => {
          token.onCancellationRequested(() => {
            console.log("Cancelling the Purge");
          });
          for (const index in allSelectedNodes) {
            progress.report({
              message: `Purging ${parseInt(index) + 1} of ${allSelectedNodes.length}`,
              increment: (parseInt(index) / allSelectedNodes.length) * 100,
            });
            const currentNode = allSelectedNodes[parseInt(index)];
            
            https.globalAgent.options.rejectUnauthorized = currentNode.parentRegion.parentSession.session.ISession.rejectUnauthorized;
            
            try {
              await purgeTask(
                currentNode.parentRegion.parentSession.session,
                {
                  name: currentNode.task.task,
                  regionName: currentNode.parentRegion.label,
                  cicsPlex: currentNode.parentRegion.parentPlex ? currentNode.parentRegion.parentPlex.getPlexName() : undefined,
                },
                purgeType!
              );
              https.globalAgent.options.rejectUnauthorized = undefined;
              if (!parentRegions.includes(currentNode.parentRegion)) {
                parentRegions.push(currentNode.parentRegion);
              }
            } catch (error) {
              https.globalAgent.options.rejectUnauthorized = undefined;
            // @ts-ignore
            if (error.mMessage) {
              // @ts-ignore
              const [_, resp2, respAlt, eibfnAlt] = splitCmciErrorMessage(error.mMessage);
              window.showErrorMessage(`Perform ${purgeType?.toUpperCase()} on CICSTask "${allSelectedNodes[parseInt(index)].task.task}" failed: EXEC CICS command (${eibfnAlt}) RESP(${respAlt}) RESP2(${resp2})`);
            } else {
              window.showErrorMessage(`Something went wrong when performing a ${purgeType?.toUpperCase()} - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(/(\\n\t|\\n|\\t)/gm," ")}`);
            }
            }
          }
          for (const parentRegion of parentRegions) {
            try {
              const taskTree = parentRegion.children!.filter((child: any) => child.contextValue.includes("cicstreetask."))[0];
              // Only load contents if the tree is expanded
              if (taskTree.collapsibleState === 2) {
                await taskTree.loadContents();
              }
              // if node is in a plex and the plex contains the region container tree
              // Note: this avoids the condition of an item in the cics task tree item having a different state to the
              // same task item in a CICS combined task tree of the same profile
              if (parentRegion.parentPlex && parentRegion.parentPlex.children.some((child) => child instanceof CICSRegionsContainer)) {
                const allTaskTreeTree = parentRegion.parentPlex.children!.filter((child: any) => child.contextValue.includes("cicscombinedlocalfiletree."))[0] as CICSCombinedTaskTree;
                // If allTasksTree is open
                if (allTaskTreeTree.collapsibleState === 2 && allTaskTreeTree.getActiveFilter()) {
                  await allTaskTreeTree.loadContents(tree);
                }
              }
            } catch(error) {
              window.showErrorMessage(`Something went wrong when reloading tasks - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(/(\\n\t|\\n|\\t)/gm," ")}`);
            }
          }
          tree._onDidChangeTreeData.fire(undefined);
        });
      }
    }
  );
}

/**
 * CMCI Purge Task request
 * @param session 
 * @param parms 
 * @param purgeType 
 * @returns 
 */
async function purgeTask(
  session: AbstractSession,
  parms: { name: string; regionName: string; cicsPlex: string; },
  purgeType: string
): Promise<ICMCIApiResponse> {
  const requestBody: any = {
    request: {
        action: {
            $: {
                name: "PURGE"
            },
            parameter: {
              $: {
                  name: "TYPE",
                  value: purgeType
              }
          }
        }, 
    }
  };

  const cicsPlex = parms.cicsPlex === undefined ? "" : parms.cicsPlex + "/";
  const cmciResource =
    "/" +
    CicsCmciConstants.CICS_SYSTEM_MANAGEMENT +
    "/" +
    "CICSTask" +
    "/" +
    cicsPlex +
    parms.regionName +
    "?CRITERIA=(TASK=" +
    parms.name +
    ")" ;
  return await CicsCmciRestClient.putExpectParsedXml(
    session,
    cmciResource,
    [],
    requestBody
  );
}
