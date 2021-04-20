import { TreeItemCollapsibleState, TreeItem } from "vscode";
import { CICSProgramTreeItem } from "./CICSProgramTree";
import { CICSSessionTreeItem } from "./CICSSessionTree";
import { join } from "path";

export class CICSRegionTreeItem extends TreeItem {
  children: CICSProgramTreeItem[];
  parentSession: CICSSessionTreeItem;
  region: any;

  constructor(
    regionName: string,
    parentSession: CICSSessionTreeItem,
    region: any,
    children?: CICSProgramTreeItem[] | CICSProgramTreeItem | undefined,
    public readonly iconPath = {
      light: join(
        __filename,
        "..",
        "..",
        "..",
        "src",
        "imgs",
        "region2-dark.svg"
      ),
      dark: join(
        __filename,
        "..",
        "..",
        "..",
        "src",
        "imgs",
        "region2-light.svg"
      ),
    }
  ) {
    super(regionName, TreeItemCollapsibleState.Collapsed);
    this.children = !Array.isArray(children) ? [children!] : children;
    this.parentSession = parentSession;
    this.region = region;
    this.contextValue = `cicsregion.${regionName}`;
  }

  public addProgramChild(programTreeItem: CICSProgramTreeItem) {
    this.children.push(programTreeItem);
  }
}
