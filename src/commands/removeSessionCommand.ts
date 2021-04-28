import { CICSTreeDataProvider } from "../trees/treeProvider";
import { commands, window } from "vscode";

export function getRemoveSessionCommand(tree: CICSTreeDataProvider) {
  return commands.registerCommand(
    "cics-extension-for-zowe.removeSession",
    async (node) => {
      if (node) {
        await tree.removeSession(node);
        tree.refresh();
      } else {
        window.showErrorMessage("No CICS program selected");
      }
    }
  );
}
