import { CICSTreeDataProvider } from "../trees/treeProvider";
import { commands } from "vscode";

export function getAddSessionCommand(tree: CICSTreeDataProvider) {
  return commands.registerCommand(
    "cics-extension-for-zowe.addSession",
    async () => tree.addSession()
  );
}