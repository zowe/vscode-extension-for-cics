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
import { join } from "path";
import { CICSProgramTreeItem } from "./treeItems/CICSProgramTreeItem";
import { CICSRegionTree } from "./CICSRegionTree";

export class CICSProgramTree extends TreeItem {
  children: CICSProgramTreeItem[] = [];
  parentRegion: CICSRegionTree;

  constructor(
    parentRegion: CICSRegionTree,
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
    super('Programs', TreeItemCollapsibleState.Collapsed);
    this.contextValue = `cicstreeprogram.programs`;
    this.parentRegion = parentRegion;
  }

  public addProgram(program: CICSProgramTreeItem) {
    this.children.push(program);
  }
}
