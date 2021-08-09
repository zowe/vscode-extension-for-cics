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
  children: [CICSProgramTree, CICSTransactionTree, CICSLocalFileTree] | null; //CICSDefinitionTree
  region: any;
  parentSession: CICSSessionTree;
  parentPlex: CICSPlexTree | undefined;
  isActive: true | false;

  public getRegionName() {
    return this.region.applid || this.region.cicsname;
  }

  public getIsActive(){
    return this.isActive;
  }

  constructor(
    regionName: string,
    region: any,
    parentSession: CICSSessionTree,
    parentPlex: CICSPlexTree | undefined,
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

    this.parentSession = parentSession;
    if (parentPlex) {
      this.parentPlex = parentPlex;
    }

    if(this.parentPlex){
      this.isActive = region.cicsstate === "ACTIVE" ? true : false;
    } else {
      this.isActive = region.cicsstatus === "ACTIVE" ? true : false;
    }
    
    if(!this.isActive){
      this.children = null;
      this.collapsibleState = TreeItemCollapsibleState.None;
      this.iconPath = {
        light: join(
          __filename,
          "..",
          "..",
          "..",
          "resources",
          "imgs",
          "file-dark.svg"
        ),
        dark: join(
          __filename,
          "..",
          "..",
          "..",
          "resources",
          "imgs",
          "file-light.svg"
        ),
      };
    } else {
      this.children = [new CICSProgramTree(this), new CICSTransactionTree(this), new CICSLocalFileTree(this)]; //, new CICSDefinitionTree(this)
    }
    
  }
}
