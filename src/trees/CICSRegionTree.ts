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
import { CICSProgramTree } from "./CICSProgramTree";
import { CICSTransactionTree } from "./CICSTransactionTree";
import { CICSLocalFileTree } from "./CICSLocalFileTree";
import { CICSSessionTree } from "./CICSSessionTree";
import { CICSPlexTree } from "./CICSPlexTree";

export class CICSRegionTree extends TreeItem {
  children: [CICSProgramTree, CICSTransactionTree, CICSLocalFileTree];
  region: any;
  parentSession: CICSSessionTree;
  parentPlex: CICSPlexTree | undefined;

  public getRegionName() {
    return this.region.applid || this.region.cicsname;
  }

  constructor(
    regionName: string,
    region: any,
    parentSession: CICSSessionTree,
    parentPlex: CICSPlexTree | undefined,
    programTree: CICSProgramTree,
    transactionTree: CICSTransactionTree,
    localFilesTree: CICSLocalFileTree,
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
    this.region = region;
    this.contextValue = `cicsregion.${regionName}`;
    this.children = [programTree, transactionTree, localFilesTree];
    this.parentSession = parentSession;
    if (parentPlex) {
      this.parentPlex = parentPlex;
    }
  }
}
