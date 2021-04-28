import {
  CicsCmciConstants,
  CicsCmciRestClient,
  ICMCIApiResponse,
  IURIMapParms,
} from "@zowe/cics-for-zowe-cli";
import { AbstractSession } from "@zowe/imperative";
import { commands, window } from "vscode";
import { CICSTreeDataProvider } from "../trees/treeProvider";

export function getEnableProgramCommand(tree: CICSTreeDataProvider) {
  return commands.registerCommand(
    "cics-extension-for-zowe.enableProgram",
    async (node) => {
      if (node) {
        window.showInformationMessage(
          `Enabling program ${node.program.program}`
        );
        console.log(node.program.program);

        try {
          const response = await enableProgram(
            node.parentRegion.parentSession.session,
            {
              name: node.program.program,
              regionName: node.parentRegion.label,
              cicsPlex: node.parentRegion.parentSession.cicsPlex,
            }
          );

          window.showInformationMessage(
            `Program ${node.program.program} STATUS: - ${response.response.records.cicsprogram.status}`
          );

          tree.refresh();
        } catch (err) {
          console.log(err);

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
  parms: IURIMapParms
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
