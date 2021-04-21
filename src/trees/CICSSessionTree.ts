import { TreeItemCollapsibleState, TreeItem } from "vscode";
import { CICSRegionTreeItem } from "./CICSRegionTree";
import { join } from "path";

export class CICSSessionTreeItem extends TreeItem {
  sessionName: string;
  children: CICSRegionTreeItem[];
  session: any;
  cicsPlex: string;

  constructor(
    sessionName: string,
    session: any,
    cicsPlex: string,
    public readonly iconPath = {
      light: join(
        __filename,
        "..",
        "..",
        "..",
        "resources",
        "imgs",
        "session2-dark.svg"
      ),
      dark: join(
        __filename,
        "..",
        "..",
        "..",
        "resources",
        "imgs",
        "session2-light.svg"
      ),
    }
  ) {
    super(sessionName, TreeItemCollapsibleState.Collapsed);
    this.sessionName = sessionName;
    this.session = session;
    this.cicsPlex = cicsPlex;
    this.children = [];
  }

  public addRegionChild(region: CICSRegionTreeItem) {
    this.children.push(region);
  }
}
