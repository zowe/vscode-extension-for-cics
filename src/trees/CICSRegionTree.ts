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
import { CICSProgramTree } from "./CICSProgramTree";
import { CICSTransactionTree } from "./CICSTransactionTree";
import { CICSLocalFileTree } from "./CICSLocalFileTree";
import { CICSSessionTree } from "./CICSSessionTree";
import { CICSPlexTree } from "./CICSPlexTree";
import { getIconPathInResources } from "../utils/getIconPath";

export class CICSRegionTree extends TreeItem {
  children: [CICSProgramTree, CICSTransactionTree, CICSLocalFileTree] | null;
  region: any;
  parentSession: CICSSessionTree;
  parentPlex: CICSPlexTree | undefined;
  isActive: true | false;

  constructor(
    regionName: string,
    region: any,
    parentSession: CICSSessionTree,
    parentPlex: CICSPlexTree | undefined,
    public iconPath = getIconPathInResources("region-dark.svg", "region-light.svg")
  ) {
    super(regionName, TreeItemCollapsibleState.Collapsed);
    this.region = region;
    this.contextValue = `cicsregion.${regionName}`;

    this.parentSession = parentSession;
    if (parentPlex) {
      this.parentPlex = parentPlex;
    }

    if (region.cicsstate) {
      this.isActive = region.cicsstate === "ACTIVE" ? true : false;
    } else {
      this.isActive = region.cicsstatus === "ACTIVE" ? true : false;
    }

    if (!this.isActive) {
      this.children = null;
      this.collapsibleState = TreeItemCollapsibleState.None;
      this.iconPath = getIconPathInResources("region-dark-disabled.svg", "region-light-disabled.svg");
    } else {
      this.children = [new CICSProgramTree(this), new CICSTransactionTree(this), new CICSLocalFileTree(this)];
    }

  }

  public getRegionName() {
    return this.region.applid || this.region.cicsname;
  }

  public getIsActive() {
    return this.isActive;
  }
  
  public getChildren() {
    return this.children;
  }
}
