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
import { CICSSessionTree } from "./CICSSessionTree";
import { CICSPlexTree } from "./CICSPlexTree";
import { getIconPathInResources } from "../utils/profileUtils";
import { CICSRegionTree } from "./CICSRegionTree";
import { CICSURIMapTree } from "./treeItems/web/CICSURIMapTree";
import { CICSTCPIPServiceTree } from "./treeItems/web/CICSTCPIPServiceTree";

export class CICSWebTree extends TreeItem {
  children: [CICSTCPIPServiceTree, CICSURIMapTree] | null;
  parentRegion: CICSRegionTree | undefined;
  //activeFilter: string | undefined = undefined;

  constructor(
    parentRegion: CICSRegionTree,
    public iconPath = getIconPathInResources("folder-closed-dark.svg", "folder-closed-light.svg")
  ) {
    super('Web', TreeItemCollapsibleState.Collapsed);
    this.contextValue = `cicstreeweb.web`;
    this.parentRegion = parentRegion;

    this.children = [new CICSTCPIPServiceTree(parentRegion), new CICSURIMapTree(parentRegion)];
    }

  public async loadContents()
  {
    this.iconPath = getIconPathInResources("folder-open-dark.svg", "folder-open-light.svg");
  }
  
  public getChildren() {
    return this.children;
  }

  public getParent() {
    return this.parentRegion;
  }

  public clearFilter() {
    /*this.activeFilter = undefined;
    this.contextValue = `cicstreeweb.${this.activeFilter ? 'filtered' : 'unfiltered'}.web`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;*/
  }

  public setFilter(newFilter: string) {
    /*this.activeFilter = newFilter;
    this.contextValue = `cicstreeweb.${this.activeFilter ? 'filtered' : 'unfiltered'}.web`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;*/
  }

  public getFilter() {
    //return this.activeFilter;
  }
  
}