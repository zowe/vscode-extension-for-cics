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
import { CICSRegionTree } from "./CICSRegionTree";
import { CICSProgramDefinitionTree } from "./CICSProgramDefinitionTree";
import { CICSTransactionDefinitionTree } from "./CICSTransactionDefinitionTree";
import { CICSFileDefinitionTree } from "./CICSFileDefinitionTree";

export class CICSDefinitionTree extends TreeItem {
  children: [CICSProgramDefinitionTree, CICSTransactionDefinitionTree, CICSFileDefinitionTree]; //, CICSTransactionDefinitionTree, CICSFileDefinitionTree
  parentRegion: CICSRegionTree;

  constructor(
    parentRegion: CICSRegionTree,
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
    super(`Definitions`, TreeItemCollapsibleState.Collapsed);
    this.contextValue = `cicsdefinitions.definitions`;
    this.parentRegion = parentRegion;
    this.children = [new CICSProgramDefinitionTree(parentRegion), new CICSTransactionDefinitionTree(parentRegion), new CICSFileDefinitionTree(parentRegion)]; //, new CICSTransactionDefinitionTree(this), new CICSFileDefinitionTree(this)
  }

  public loadContents() {
    for (const child of this.children) {
      child.loadContents();
    }
  }
}
