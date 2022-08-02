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
import { CICSDb2TransactionTreeItem } from "../trees/treeItems/CICSDb2TransactionTreeItem";
import { CICSRegionsContainer } from "../trees/CICSRegionsContainer";
import { CICSCombinedDb2TransactionsTree } from "../trees/Db2/CICSCombinedDb2TransactionTree";

/**
 * Purge a CICS Db2Transaction and reload the CICS Db2Transaction tree contents and the combined Db2Transaction tree contents
 * @param tree 
 * @param treeview 
 * @returns 
 */
export function getPurgeDb2TransactionCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.purgeDb2Transaction",
    async (clickedNode) => {
      const allSelectedNodes = findSelectedNodes(treeview, CICSDb2TransactionTreeItem, clickedNode);
      if (!allSelectedNodes || !allSelectedNodes.length) {
        window.showErrorMessage("No CICS Db2 transaction selected");
        return;
      }
      let parentRegions: CICSRegionTree[] = [];
      let choice = await window.showWarningMessage(
        `Are you sure you want to purge the transactions `,
        ...["Yes", "No"]);
      if (choice && choice === "Yes"){
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
              await purgeDb2Transaction(
                currentNode.parentRegion.parentSession.session,
                {
                  name: currentNode.db2transaction.name,
                  regionName: currentNode.parentRegion.label,
                  cicsPlex: currentNode.parentRegion.parentPlex ? currentNode.parentRegion.parentPlex.getPlexName() : undefined,
                },
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
              window.showErrorMessage(`Perform PURGE on CICSDb2Transaction "${allSelectedNodes[parseInt(index)].db2transaction.name}" failed: EXEC CICS command (${eibfnAlt}) RESP(${respAlt}) RESP2(${resp2})`);
            } else {
              window.showErrorMessage(`Something went wrong when performing a PURGE - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(/(\\n\t|\\n|\\t)/gm," ")}`);
            }
            }
          }
          for (const parentRegion of parentRegions) {
            try {
              const db2TransactionTree = parentRegion.children!.filter((child: any) => child.contextValue.includes("cicstreedb2transaction."))[0];
              // Only load contents if the tree is expanded
              if (db2TransactionTree.collapsibleState === 2) {
                await db2TransactionTree.loadContents();
              }
              // if node is in a plex and the plex contains the region container tree
              // Note: this avoids the condition of an item in the cics db2 transactions tree item having a different state to the
              // same db2 transactions item in a CICS combined db2 transactions tree of the same profile
              if (parentRegion.parentPlex && parentRegion.parentPlex.children.some((child) => child instanceof CICSRegionsContainer)) {
                const allDb2TransactionTreeTree = parentRegion.parentPlex.children!.filter((child: any) => child.contextValue.includes("cicscombinedlocalfiletree."))[0] as CICSCombinedDb2TransactionsTree;
                // If allDb2TransactionsTree is open
                if (allDb2TransactionTreeTree.collapsibleState === 2 && allDb2TransactionTreeTree.getActiveFilter()) {
                  await allDb2TransactionTreeTree.loadContents(tree);
                }
              }
            } catch(error) {
              window.showErrorMessage(`Something went wrong when reloading Db2 transactions - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(/(\\n\t|\\n|\\t)/gm," ")}`);
            }
          }
          tree._onDidChangeTreeData.fire(undefined);
        });
      }
    }
  );
}

/**
 * CMCI Purge Db2Transaction request
 * @param session 
 * @param parms 
 * @returns 
 */
async function purgeDb2Transaction(
  session: AbstractSession,
  parms: { name: string; regionName: string; cicsPlex: string; },
): Promise<ICMCIApiResponse> {
  const cicsPlex = parms.cicsPlex === undefined ? "" : parms.cicsPlex + "/";
  const cmciResource =
    "/" +
    CicsCmciConstants.CICS_SYSTEM_MANAGEMENT +
    "/" +
    "CICSDb2Transaction" +
    "/" +
    cicsPlex +
    parms.regionName +
    "?CRITERIA=(NAME=" +
    parms.name +
    ")" ;
  return await CicsCmciRestClient.deleteExpectParsedXml(
    session,
    cmciResource,
    [],
  );
}
