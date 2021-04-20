import { CICSTreeDataProvider } from "../trees/treeProvider";
import { commands } from "vscode";

export function getRefreshCommand(tree: CICSTreeDataProvider) {
  return commands.registerCommand(
    "cics-extension-for-zowe.refreshTree",
    async () => tree.refresh()
  );
}
