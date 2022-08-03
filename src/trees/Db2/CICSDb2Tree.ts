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

import { TreeItemCollapsibleState, TreeItem, window } from "vscode";
import { CICSDb2TransactionTree } from "./CICSDb2TransactionTree";
import { CICSDb2TransactionDefinitionTree } from "./CICSDb2TransactionDefinitionTree";
import { CICSRegionTree } from "../CICSRegionTree";
import { CICSPlexTree } from "../CICSPlexTree";
import { CICSSessionTree } from "../CICSSessionTree";
import { getIconPathInResources } from "../../utils/profileUtils";

export class CICSDb2Tree extends TreeItem {
  children: [CICSDb2TransactionTree, CICSDb2TransactionDefinitionTree];
  parentRegion: CICSRegionTree;
  activeFilter: string | undefined = undefined;
  parentPlex: CICSPlexTree | undefined;
  parentSession: CICSSessionTree;
  constructor(
    parentRegion: CICSRegionTree,
    public iconPath = getIconPathInResources("folder-closed-dark.svg", "folder-closed-light.svg")
  ) {
    super('Db2', TreeItemCollapsibleState.Collapsed);
    this.contextValue = `cicstreedb2tree.${this.activeFilter ? 'filtered' : 'unfiltered'}.db2transactions`;
    this.parentRegion = parentRegion;
    this.children = [new CICSDb2TransactionTree(this), new CICSDb2TransactionDefinitionTree(this)];
    this.parentPlex = parentRegion.parentPlex;
    this.parentSession = parentRegion.parentSession;

  }

  public async loadContents() {
  }

  public clearFilter() {
    this.activeFilter = undefined;
    this.contextValue = `cicstreedb2tree.${this.activeFilter ? 'filtered' : 'unfiltered'}.db2transactions`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public setFilter(newFilter: string) {
    this.activeFilter = newFilter;
    this.contextValue = `cicstreedb2tree.${this.activeFilter ? 'filtered' : 'unfiltered'}.db2transactions`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public getFilter() {
    return this.activeFilter;
  }

  public getRegionName() {
    return this.parentRegion.region.applid || this.parentRegion.region.cicsname;
  }
}
