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

import { CicsCmciConstants, CicsCmciRestClient } from "@zowe/cics-for-zowe-cli";
import { AbstractSession } from "@zowe/imperative";
import { commands, ProgressLocation, TreeView, window } from "vscode";
import { CICSRegionTree } from "../trees/CICSRegionTree";
import { CICSTree } from "../trees/CICSTree";

export function getPhaseInCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.phaseInCommand",
    async (clickedNode) => {
      if (clickedNode) {
        try {
          const selectedNodes = treeview.selection.filter((selectedNode) => selectedNode !== clickedNode);
          const allSelectedNodes = [clickedNode, ...selectedNodes];
          let parentRegions : CICSRegionTree[] = [];

          window.withProgress({
            title: 'Phase In',
            location: ProgressLocation.Notification,
            cancellable: true
          }, async (progress, token) => {
            token.onCancellationRequested(() => {
              console.log("Cancelling the Phase In");
            });
          for (const index in allSelectedNodes) {
            progress.report({
              message: `Phase In ${parseInt(index) + 1} of ${allSelectedNodes.length}`,
              increment: (parseInt(index) / allSelectedNodes.length) * 100,
            });
            try {
              const currentNode = allSelectedNodes[parseInt(index)];
              await performPhaseIn(
                currentNode.parentRegion.parentSession.session,
                {
                  name: currentNode.program.program,
                  regionName: currentNode.parentRegion.label,
                  cicsPlex: currentNode.parentRegion.parentPlex ? currentNode.parentRegion.parentPlex.plexName : undefined,
                }
              );

              if(!parentRegions.includes(currentNode.parentRegion)){
                parentRegions.push(currentNode.parentRegion);
              }
            } catch(err){
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
                window.showErrorMessage(`Perform PHASEIN on Program "${allSelectedNodes[parseInt(index)].program.program}" failed: EXEC CICS command (${eibfnAlt}) RESP(${respAlt}) RESP2(${resp2})`);
            }
          }
          for (const parentRegion of parentRegions){
            const programTree = parentRegion.children!.filter((child: any) => child.contextValue.includes("cicstreeprogram."))[0];
            await programTree.loadContents();
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

async function performPhaseIn(
  session: AbstractSession,
  parms: { cicsPlex: string | null; regionName: string; name: string; }
) {
  const requestBody: any = {
    request: {
      action: {
        $: {
          name: "PHASEIN",
        },
      },
    },
  };

  const cicsPlex = parms.cicsPlex === undefined ? "" : parms.cicsPlex + "/";
  const cmciResource =
    "/" +
    CicsCmciConstants.CICS_SYSTEM_MANAGEMENT +
    "/" +
    CicsCmciConstants.CICS_PROGRAM_RESOURCE +
    "/" +
    cicsPlex +
    parms.regionName +
    "?CRITERIA=(PROGRAM=" +
    parms.name +
    ")";

  return CicsCmciRestClient.putExpectParsedXml(
    session,
    cmciResource,
    [],
    requestBody
  ) as any;
}
