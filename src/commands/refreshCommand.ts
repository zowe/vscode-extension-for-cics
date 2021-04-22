import { CICSTreeDataProvider } from "../trees/treeProvider";
import { commands, window } from "vscode";

export function getRefreshCommand(tree: CICSTreeDataProvider) {
  return commands.registerCommand(
    "cics-extension-for-zowe.refreshTree",
    async () => {
      window.showInformationMessage(
        `Refreshing Sessions`
      );

      const item = window.createStatusBarItem();
      item.text = 'Refreshing...';
      item.show();
      
      await tree.refresh();
      window.showInformationMessage(
        `Sessions Refresh Completed`
      );
      item.hide();
    }
  );
}
