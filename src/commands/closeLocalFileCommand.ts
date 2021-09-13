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


export function getCloseLocalFileCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.closeLocalFile",
    async (clickedNode) => {
      if (clickedNode) {
        try {
          let selectedNodes = treeview.selection;
          let parentRegions: CICSRegionTree[] = [];

          window.withProgress({
            title: 'Close',
            location: ProgressLocation.Notification,
            cancellable: true
          }, async (progress, token) => {
            token.onCancellationRequested(() => {
              console.log("Cancelling the Close");
            });
            for (const index in selectedNodes) {
              progress.report({
                message: `Closing ${parseInt(index) + 1} of ${selectedNodes.length}`,
                increment: (parseInt(index) / selectedNodes.length) * 100,
              });
              try {
                const currentNode = selectedNodes[parseInt(index)];
                await closeLocalFile(
                  currentNode.parentRegion.parentSession.session,
                  {
                    name: currentNode.localFile.file,
                    regionName: currentNode.parentRegion.label,
                    cicsPlex: currentNode.parentRegion.parentPlex ? currentNode.parentRegion.parentPlex.plexName : undefined,
                  }
                );
                if (!parentRegions.includes(currentNode.parentRegion)) {
                  parentRegions.push(currentNode.parentRegion);
                }
              } catch (err) {
                // @ts-ignore
                const mMessageArr = err.mMessage.replaceAll(' ', '').split("\n");
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
                window.showErrorMessage(`Perform CLOSE on Local file "${selectedNodes[parseInt(index)].localFile.file}" failed: EXEC CICS command (${eibfnAlt}) RESP(${respAlt}) RESP2(${resp2})`);
              }
            }
            for (const parentRegion of parentRegions) {
              const programTree = parentRegion.children!.filter((child: any) => child.contextValue.includes("cicstreelocalfile."))[0];
              await programTree.loadContents();
            }
            tree._onDidChangeTreeData.fire(undefined);
          });
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

async function closeLocalFile(
  session: AbstractSession,
  parms: { name: string; regionName: string; cicsPlex: string; }
): Promise<ICMCIApiResponse> {
  const requestBody: any = {
    request: {
        action: {
            $: {
                name: "CLOSE"
            },
            parameter: {
              $: {
                  name: "BUSY",
                  value: "WAIT"
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
    ")";

  return await CicsCmciRestClient.putExpectParsedXml(
    session,
    cmciResource,
    [],
    requestBody
  );
}