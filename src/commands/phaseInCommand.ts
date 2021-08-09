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
import { commands, TreeView, window } from "vscode";
import { CICSRegionTree } from "../trees/CICSRegionTree";
import { CICSTree } from "../trees/CICSTree";

export function getPhaseInCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.phaseInCommand",
    async (node) => {
      if (node) {
        try {
          let selectedNodes = treeview.selection;
          let parentRegions : CICSRegionTree[] = [];

          for (let node of selectedNodes) {
            try {
              const response = await performPhaseIn(
                node.parentRegion.parentSession.session,
                {
                  name: node.program.program,
                  regionName: node.parentRegion.label,
                  cicsPlex: node.parentRegion.parentPlex ? node.parentRegion.parentPlex.plexName : undefined,
                }
              );
              window.showInformationMessage(
                `New Copy Count for ${node.label} = ${response.response.records.cicsprogram.newcopycnt}`
              );

              if(!parentRegions.includes(node.parentRegion)){
                parentRegions.push(node.parentRegion);
              }
            } catch(err){
              window.showErrorMessage(err);
            }
          }

          for (const parentRegion of parentRegions){
            const programTree = parentRegion.children!.filter((child: any) => child.contextValue.includes("cicstreeprogram."))[0];
            await programTree.loadContents();
          }

          tree._onDidChangeTreeData.fire(undefined);
        } catch (err) {
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
