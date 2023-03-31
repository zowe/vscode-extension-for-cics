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
import { CICSWebServiceTreeItem } from "./treeItems/CICSWebServiceTreeItem";
import { CICSRegionTree } from "../../CICSRegionTree";
import { getResource } from "@zowe/cics-for-zowe-cli";
import * as https from "https";
import { toEscapedCriteriaString } from "../../../utils/filterUtils";
import { getIconPathInResources } from "../../../utils/profileUtils";
export class CICSWebServiceTree extends TreeItem {
  children: CICSWebServiceTreeItem[] = [];
  parentRegion: CICSRegionTree;
  activeFilter: string | undefined = undefined;

  constructor(
    parentRegion: CICSRegionTree,
    public iconPath = getIconPathInResources("folder-closed-dark.svg", "folder-closed-light.svg")
  ) {
    super('Web Services', TreeItemCollapsibleState.Collapsed);
    this.contextValue = `cicstreewebservice.${this.activeFilter ? 'filtered' : 'unfiltered'}.webservices`;
    this.parentRegion = parentRegion;
  }

  public addWebService(webservice: CICSWebServiceTreeItem) {
    this.children.push(webservice);
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

      const webserviceResponse = await getResource(this.parentRegion.parentSession.session, {
        name: "CICSWebService",
        regionName: this.parentRegion.getRegionName(),
        cicsPlex: this.parentRegion.parentPlex ? this.parentRegion.parentPlex!.getPlexName() : undefined,
        criteria: criteria
      });
      https.globalAgent.options.rejectUnauthorized = undefined;
      const webservicesArray = Array.isArray(webserviceResponse.response.records.cicswebservice) ? webserviceResponse.response.records.cicswebservice : [webserviceResponse.response.records.cicswebservice];
      this.label = `Web Services${this.activeFilter?` (${this.activeFilter}) `: " "}[${ webservicesArray.length}]`;
      for (const webservice of  webservicesArray) {
        const newWebServiceItem = new CICSWebServiceTreeItem(webservice, this.parentRegion, this);
        newWebServiceItem.setLabel(newWebServiceItem.label!.toString().replace(webservice.name, `${webservice.name}`));
        this.addWebService(newWebServiceItem);
      }
      this.iconPath = getIconPathInResources("folder-open-dark.svg", "folder-open-light.svg");
    } catch (error) {
      https.globalAgent.options.rejectUnauthorized = undefined;
      if ((error as any)!.mMessage!.includes('exceeded a resource limit')) {
        window.showErrorMessage(`Resource Limit Exceeded - Set a Web Services filter to narrow search`);
      } else if ((this.children.length === 0)) {
        window.showInformationMessage(`No Web Services found`);
        this.label = `Web Services${this.activeFilter?` (${this.activeFilter}) `: " "}[0]`;
      } else {
        window.showErrorMessage(`Something went wrong when fetching Web Services - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(/(\\n\t|\\n|\\t)/gm," ")}`);
      }
    }

  }

  public clearFilter() {
    this.activeFilter = undefined;
    this.contextValue = `cicstreewebservice.${this.activeFilter ? 'filtered' : 'unfiltered'}.webservices`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public setFilter(newFilter: string) {
    this.activeFilter = newFilter;
    this.contextValue = `cicstreewebservice.${this.activeFilter ? 'filtered' : 'unfiltered'}.webservices`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public getFilter() {
    return this.activeFilter;
  }
  
  public getParent() {
    return this.parentRegion;
  }
}