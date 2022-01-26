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
import { CICSRegionsContainer } from "../trees/CICSRegionsContainer";
import { CICSLocalFileTreeItem } from "../trees/treeItems/CICSLocalFileTreeItem";
import { findSelectedNodes } from "../utils/commandUtils";

export function getEnableLocalFileCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.enableLocalFile",
    async (clickedNode) => {
      const allSelectedNodes = findSelectedNodes(treeview, CICSLocalFileTreeItem, clickedNode);
      if (!allSelectedNodes || !allSelectedNodes.length) {
        window.showErrorMessage("No CICS Local File selected");
        return;
      }
      let parentRegions: CICSRegionTree[] = [];
      window.withProgress({
        title: 'Enable',
        location: ProgressLocation.Notification,
        cancellable: true
      }, async (progress, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the Enable");
        });
        for (const index in allSelectedNodes) {
          progress.report({
            message: `Enabling ${parseInt(index) + 1} of ${allSelectedNodes.length}`,
            increment: (parseInt(index) / allSelectedNodes.length) * 100,
          });
          const currentNode = allSelectedNodes[parseInt(index)];
          
          https.globalAgent.options.rejectUnauthorized = currentNode.parentRegion.parentSession.session.ISession.rejectUnauthorized;
          
          try {
            await enableLocalFile(
              currentNode.parentRegion.parentSession.session,
              {
                name: currentNode.localFile.file,
                regionName: currentNode.parentRegion.label,
                cicsPlex: currentNode.parentRegion.parentPlex ? currentNode.parentRegion.parentPlex.getPlexName() : undefined,
              }
            );
            https.globalAgent.options.rejectUnauthorized = undefined;
            if (!parentRegions.includes(currentNode.parentRegion)) {
              parentRegions.push(currentNode.parentRegion);
            }
          } catch (error) {
            https.globalAgent.options.rejectUnauthorized = undefined;
            window.showErrorMessage(`Something went wrong when performing an ENABLE - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(/(\\n\t|\\n|\\t)/gm," ")}`);
          }
        }
        // Reload contents
        for (const parentRegion of parentRegions) {
          try {
            const localFileTree = parentRegion.children!.filter((child: any) => child.contextValue.includes("cicstreelocalfile."))[0];
            // Only load contents if the tree is expanded
            if (localFileTree.collapsibleState === 2) {
              await localFileTree.loadContents();
            }
            // if node is in a plex and the plex contains the region container tree
            if (parentRegion.parentPlex && parentRegion.parentPlex.children.some((child) => child instanceof CICSRegionsContainer)) {
              const allLocalFileTreeTree = parentRegion.parentPlex.children!.filter((child: any) => child.contextValue.includes("cicscombinedlocalfiletree."))[0];
              //@ts-ignore
              if (allLocalFileTreeTree.collapsibleState === 2 && allLocalFileTreeTree.getActiveFilter()) {
                //@ts-ignore
                await allLocalFileTreeTree.loadContents(tree);
              }
            }
          } catch (error) {
            window.showErrorMessage(`Something went wrong when reloading local files - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(/(\\n\t|\\n|\\t)/gm," ")}`);
          }
        }
        tree._onDidChangeTreeData.fire(undefined);
      });
    }
  );
}

async function enableLocalFile(
  session: AbstractSession,
  parms: { name: string; regionName: string; cicsPlex: string; }
): Promise<ICMCIApiResponse> {
  const requestBody: any = {
    request: {
      action: {
        $: {
          name: "ENABLE",
        },
      },
    },
  };

  const cicsPlex = parms.cicsPlex === undefined ? "" : parms.cicsPlex + "/";
  const cmciResource =
    "/" +
    CicsCmciConstants.CICS_SYSTEM_MANAGEMENT +
    "/" +
    "CICSLocalFile" + //CicsCmciConstants.CICS_CMCI_EXTERNAL_RESOURCES[3]
    "/" +
    cicsPlex +
    parms.regionName +
    "?CRITERIA=(FILE=" +
    parms.name +
    ")";

  return await CicsCmciRestClient.putExpectParsedXml(
    session,
    cmciResource,
    [],
    requestBody
  );
}