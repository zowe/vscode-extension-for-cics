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


export function getEnableProgramCommand(treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.enableProgram",
    async (clickedNode) => {
      if (clickedNode) {
        try {
          let selectedNodes = treeview.selection;

          window.withProgress({
            title: 'Enable',
            location: ProgressLocation.Notification,
            cancellable: true
          }, async (progress, token) => {
            token.onCancellationRequested(() => {
              console.log("Cancelling the Enable");
            });
            for (const index in selectedNodes) {
              progress.report({
                message: `Enabling ${parseInt(index) + 1} of ${selectedNodes.length}`,
                increment: (parseInt(index) / selectedNodes.length) * 100,
              });
              try {
                const currentNode = selectedNodes[parseInt(index)];

                await enableProgram(
                  currentNode.parentRegion.parentSession.session,
                  {
                    name: currentNode.program.program,
                    regionName: currentNode.parentRegion.label,
                    cicsPlex: currentNode.parentRegion.parentPlex ? currentNode.parentRegion.parentPlex.plexName : undefined,
                  }
                );
                
              } catch(err){
                window.showErrorMessage(err);
              }
            }
        });
        } catch (err) {
          window.showErrorMessage(err);
        }
      } else {
        window.showErrorMessage("No CICS program selected");
      }
    }
  );
}

async function enableProgram(
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
  );
}
