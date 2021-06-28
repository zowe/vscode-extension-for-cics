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
import { commands, window } from "vscode";
import { CICSTreeDataProvider } from "../trees/treeProvider";

export function getPhaseInCommand(tree: CICSTreeDataProvider) {
  return commands.registerCommand(
    "cics-extension-for-zowe.phaseInCommand",
    async (node) => {
      if (node) {
        window.showInformationMessage(
          `Phase-In Requested for program ${node.label}`
        );
        try {
          const response = await performPhaseIn(
            node.parentRegion.parentSession.session,
            {
              name: node.label,
              regionName: node.parentRegion.label,
              cicsPlex: node.parentRegion.parentSession.cicsPlex,
            }
          );

          window.showInformationMessage(
            `New Copy Count for ${node.label} - ${response.response.records.cicsprogram.newcopycnt}`
          );
          tree.refresh();
        } catch (err) {
          console.log(err);
          window.showErrorMessage(err);
        }
      }
    }
  );
}

async function performPhaseIn(
  session: AbstractSession,
  parms: { cicsPlex: string | null; regionName: string; name: string }
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
