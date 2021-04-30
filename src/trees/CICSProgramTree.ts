import { TreeItemCollapsibleState, TreeItem } from "vscode";
import { CICSRegionTreeItem } from "./CICSRegionTree";
import { join } from "path";

export class CICSProgramTreeItem extends TreeItem {
  program: any;
  parentRegion: CICSRegionTreeItem;

  constructor(
    program: any,
    parentRegion: CICSRegionTreeItem,
    public readonly iconPath = {
      light: join(__filename, "..", "..", "..", "resources", "imgs", "program-dark.svg"),
      dark: join(__filename, "..", "..", "..", "resources", "imgs", "program-light.svg"),
    }
  ) {
    super(
      `${program.program}${
        program.status.toLowerCase() === "disabled" ? " (Disabled)" : ""
      }`,
      TreeItemCollapsibleState.None
    );
    this.program = program;
    this.parentRegion = parentRegion;
    this.contextValue = `cicsprogram.${program.status.toLowerCase()}.${
      program.program
    }`;
  }
}
