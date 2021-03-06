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
import { AbstractSession, couldNotInstantiateCommandHandler } from "@zowe/imperative";
import { commands, ProgressLocation, TreeView, window } from "vscode";
import { CICSRegionTree } from "../trees/CICSRegionTree";
import { CICSTree } from "../trees/CICSTree";

export function getDisableTransactionCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.disableTransaction",
    async (node) => {
      if (node) {
        try {
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
                await disableTransaction(
                  currentNode.parentRegion.parentSession.session,
                  {
                    name: currentNode.transaction.tranid,
                    regionName: currentNode.parentRegion.label,
                    cicsPlex: currentNode.parentRegion.parentPlex ? currentNode.parentRegion.parentPlex.plexName : undefined,
                  }
                );
                if (!parentRegions.includes(currentNode.parentRegion)) {
                  parentRegions.push(currentNode.parentRegion);
                }
              } catch (err) {
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
                window.showErrorMessage(`Perform DISABLE on Transaction "${selectedNodes[parseInt(index)].transaction.tranid}" failed: EXEC CICS command (${eibfnAlt}) RESP(${respAlt}) RESP2(${resp2})`);
              }
            }
            for (const parentRegion of parentRegions) {
              const programTree = parentRegion.children!.filter((child: any) => child.contextValue.includes("cicstreetransaction."))[0];
              await programTree.loadContents();
            }
            tree._onDidChangeTreeData.fire(undefined);
          });
        } catch (err) {
          // @ts-ignore
          window.showErrorMessage(err);
        }
      } else {
        window.showErrorMessage("No CICS transaction selected");
      }
    }
  );
}

async function disableTransaction(
  session: AbstractSession,
  parms: { name: string; regionName: string; cicsPlex: string; }
): Promise<ICMCIApiResponse> {
  const requestBody: any = {
    request: {
      action: {
        $: {
          name: "DISABLE",
        },
      },
    },
  };

  const cicsPlex = parms.cicsPlex === undefined ? "" : parms.cicsPlex + "/";
  const cmciResource =
    "/" +
    CicsCmciConstants.CICS_SYSTEM_MANAGEMENT +
    "/" +
    CicsCmciConstants.CICS_LOCAL_TRANSACTION +
    "/" +
    cicsPlex +
    parms.regionName +
    "?CRITERIA=(TRANID=" +
    parms.name +
    ")";
  return await CicsCmciRestClient.putExpectParsedXml(
    session,
    cmciResource,
    [],
    requestBody
  );
}
