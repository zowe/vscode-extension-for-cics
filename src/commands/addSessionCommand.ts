import { CICSTreeDataProvider } from "../trees/treeProvider";
import { commands, window } from "vscode";

export function getAddSessionCommand(tree: CICSTreeDataProvider) {
  return commands.registerCommand(
    "cics-extension-for-zowe.addSession",
    async () => {
      const item = window.createStatusBarItem();
      item.text = "Adding Session...";
      item.show();
      await tree.addSession();
      item.hide();
    }
  );
}
