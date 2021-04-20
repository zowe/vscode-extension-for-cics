import { programNewcopy } from "@zowe/cics-for-zowe-cli";
import { commands, window } from "vscode";

export function getNewCopyCommand() {
  return commands.registerCommand(
    "cics-extension-for-zowe.newCopyProgram",
    async (node) => {
      if (node) {
        window.showInformationMessage(
          `New Copy Requested for program ${node.label}`
        );
        try {
          const response = await programNewcopy(
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
