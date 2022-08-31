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
import { CICSURIMapTreeItem } from "./treeItems/CICSURIMapTreeItem";
import { CICSRegionTree } from "../../CICSRegionTree";
import { getResource } from "@zowe/cics-for-zowe-cli";
import * as https from "https";
import { toEscapedCriteriaString } from "../../../utils/filterUtils";
import { getIconPathInResources } from "../../../utils/profileUtils";
export class CICSURIMapTree extends TreeItem {
  children: CICSURIMapTreeItem[] = [];
  parentRegion: CICSRegionTree;
  activeFilter: string | undefined = undefined;

  constructor(
    parentRegion: CICSRegionTree,
    public iconPath = getIconPathInResources("folder-closed-dark.svg", "folder-closed-light.svg")
  ) {
    super('URI Maps', TreeItemCollapsibleState.Collapsed);
    this.contextValue = `cicstreeurimaps.${this.activeFilter ? 'filtered' : 'unfiltered'}.urimaps`;
    this.parentRegion = parentRegion;
  }

  public addURIMAP(urimap: CICSURIMapTreeItem) {
    this.children.push(urimap);
  }

  public async loadContents() {
    let defaultCriteria = '(name=*)';
    let criteria;
    if (this.activeFilter) {
      criteria = toEscapedCriteriaString(this.activeFilter, 'NAME');
    } else {
      criteria = defaultCriteria;
    }
    this.children = [];
    try {

      https.globalAgent.options.rejectUnauthorized = this.parentRegion.parentSession.session.ISession.rejectUnauthorized;

      const urimapResponse = await getResource(this.parentRegion.parentSession.session, {
        name: "CICSURIMap",
        regionName: this.parentRegion.getRegionName(),
        cicsPlex: this.parentRegion.parentPlex ? this.parentRegion.parentPlex!.getPlexName() : undefined,
        criteria: criteria
      });
      https.globalAgent.options.rejectUnauthorized = undefined;
      const urimapArray = Array.isArray(urimapResponse.response.records.cicsurimap) ? urimapResponse.response.records.cicsurimap : [urimapResponse.response.records.cicsurimap];
      this.label = `URI Maps${this.activeFilter?` (${this.activeFilter}) `: " "}[${ urimapArray.length}]`;
      for (const urimap of  urimapArray) {
        const newURIMapItem = new CICSURIMapTreeItem(urimap, this.parentRegion, this);
        this.addURIMAP(newURIMapItem);
      }
      this.iconPath = getIconPathInResources("folder-open-dark.svg", "folder-open-light.svg");
    } catch (error) {
      https.globalAgent.options.rejectUnauthorized = undefined;
      if ((error as any)!.mMessage!.includes('exceeded a resource limit')) {
        window.showErrorMessage(`Resource Limit Exceeded - Set a URIMap filter to narrow search`);
      } else if ((this.children.length == 0)) {
        window.showInformationMessage(`No URI Maps found`);
        this.label = `URI Maps${this.activeFilter?` (${this.activeFilter}) `: " "}[0]`;
      } else {
        window.showErrorMessage(`Something went wrong when fetching URI Maps - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(/(\\n\t|\\n|\\t)/gm," ")}`);
      }
    }

  }

  public clearFilter() {
    this.activeFilter = undefined;
    this.contextValue = `cicstreeurimaps.${this.activeFilter ? 'filtered' : 'unfiltered'}.urimap`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public setFilter(newFilter: string) {
    this.activeFilter = newFilter;
    this.contextValue = `cicstreeurimaps.${this.activeFilter ? 'filtered' : 'unfiltered'}.urimap`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public getFilter() {
    return this.activeFilter;
  }
  
  public getParent() {
    return this.parentRegion;
  }
}