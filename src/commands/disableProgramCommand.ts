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
  IURIMapParms,
} from "@zowe/cics-for-zowe-cli";
import { AbstractSession } from "@zowe/imperative";
import { commands, window } from "vscode";
import { CICSTree } from "../trees/CICSTree";

export function getDisableProgramCommand(tree: CICSTree) {
  return commands.registerCommand(
    "cics-extension-for-zowe.disableProgram",
    async (node) => {
      if (node) {
        try {
          const response = await disableProgram(
            node.parentRegion.parentSession.session,
            {
              name: node.program.program,
              regionName: node.parentRegion.label,
              cicsPlex: node.parentRegion.parentPlex ? node.parentRegion.parentPlex.plexName : undefined,
            }
          );
          window.showInformationMessage(
            `Program ${node.program.program} STATUS: - ${response.response.records.cicsprogram.status}`
          );
        } catch (err) {
          window.showErrorMessage(err);
        }
      } else {
        window.showErrorMessage("No CICS program selected");
      }
    }
  );
}

async function disableProgram(
  session: AbstractSession,
  parms: IURIMapParms
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
