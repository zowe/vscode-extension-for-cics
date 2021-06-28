/*
* This program and the accompanying materials are made available under the terms of the
* Eclipse Public License v2.0 which accompanies this distribution, and is available at
* https://www.eclipse.org/legal/epl-v20.html
*
* SPDX-License-Identifier: EPL-2.0
*
* Copyright Contributors to the Zowe Project.
*
*/

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
    public iconPath = {
      light: join(
        __filename,
        "..",
        "..",
        "..",
        "resources",
        "imgs",
        "region-dark.svg"
      ),
      dark: join(
        __filename,
        "..",
        "..",
        "..",
        "resources",
        "imgs",
        "region-light.svg"
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
