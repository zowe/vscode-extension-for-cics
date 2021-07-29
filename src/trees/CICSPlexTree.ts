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
import { CICSRegionTree } from "./CICSRegionTree";
import { join } from "path";

export class CICSPlexTree extends TreeItem {
  children: CICSRegionTree[] = [];
  plexName: string;

  constructor(
    plexName: string,
    public readonly iconPath = {
      light: join(
        __filename,
        "..",
        "..",
        "..",
        "resources",
        "imgs",
        "list-dark.svg"
      ),
      dark: join(
        __filename,
        "..",
        "..",
        "..",
        "resources",
        "imgs",
        "list-light.svg"
      ),
    }
  ) {
    super(plexName, TreeItemCollapsibleState.Collapsed);
    this.plexName = plexName;
    this.contextValue = `cicsplex.${plexName}`;
  }

  public addRegion(region: CICSRegionTree) {
    this.children.push(region);
  }

  public getPlexName() {
    return this.plexName;
  }
}
