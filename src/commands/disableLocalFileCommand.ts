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

export function getDisableLocalFileCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.disableLocalFile",
    async (node) => {
      if (node) {
        try {
          let busyDecision = await window.showInformationMessage(
            `Choose one of the following for the file busy condition`,
            ...["Wait", "No Wait", "Force"]);
          if (busyDecision){
            busyDecision =  busyDecision.replace(" ","").toUpperCase();
            let selectedNodes = treeview.selection;
            let parentRegions: CICSRegionTree[] = [];

            window.withProgress({
              title: 'Disable',
              location: ProgressLocation.Notification,
              cancellable: true
            }, async (progress, token) => {
              token.onCancellationRequested(() => {
                console.log("Cancelling the Disable");
              });
              for (const index in selectedNodes) {
                progress.report({
                  message: `Disabling ${parseInt(index) + 1} of ${selectedNodes.length}`,
                  increment: (parseInt(index) / selectedNodes.length) * 100,
                });
                try {
                  const currentNode = selectedNodes[parseInt(index)];
                  await disableLocalFile(
                    currentNode.parentRegion.parentSession.session,
                    {
                      name: currentNode.localFile.file,
                      regionName: currentNode.parentRegion.label,
                      cicsPlex: currentNode.parentRegion.parentPlex ? currentNode.parentRegion.parentPlex.plexName : undefined,
                    },
                    busyDecision!
                  );
                  if (!parentRegions.includes(currentNode.parentRegion)) {
                    parentRegions.push(currentNode.parentRegion);
                  }
                } catch (err) {
                  // @ts-ignore
                  window.showErrorMessage(err);
                }
              }
              for (const parentRegion of parentRegions) {
                const programTree = parentRegion.children!.filter((child: any) => child.contextValue.includes("cicstreelocalfile."))[0];
                await programTree.loadContents();
              }
              tree._onDidChangeTreeData.fire(undefined);
            });
          }
        } catch (err) {
          // @ts-ignore
          window.showErrorMessage(err);
        }
      } else {
        window.showErrorMessage("No CICS local file selected");
      }
    }
  );
}

async function disableLocalFile(
  session: AbstractSession,
  parms: { name: string; regionName: string; cicsPlex: string; },
  busyDecision: string
): Promise<ICMCIApiResponse> {
  const requestBody: any = {
    request: {
        action: {
            $: {
                name: "DISABLE"
            },
            parameter: {
              $: {
                  name: "BUSY",
                  value: busyDecision
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
    "CICSLocalFile" + //CicsCmciConstants.CICS_CMCI_EXTERNAL_RESOURCES[3]
    "/" +
    cicsPlex +
    parms.regionName +
    "?CRITERIA=(FILE=" +
    parms.name +
    ")" ;//+
    //"&PARAMETER=('BUSY(WAIT).')";

  return await CicsCmciRestClient.putExpectParsedXml(
    session,
    cmciResource,
    [],
    requestBody
  );
}
