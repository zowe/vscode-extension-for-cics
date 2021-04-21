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
      light: join(__filename, "..", "..", "..", "resources", "imgs", "cogs-dark.svg"),
      dark: join(__filename, "..", "..", "..", "resources", "imgs", "cogs-light.svg"),
    }
  ) {
    super(program.program, TreeItemCollapsibleState.None);
    this.program = program;
    this.parentRegion = parentRegion;
    this.contextValue = `cicsprogram.${program.program}`;
  }
}
