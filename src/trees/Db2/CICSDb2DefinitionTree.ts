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
import { CICSDb2DefinitionTreeItem } from "../treeItems/CICSDb2DefinitionTreeItem";
import { CICSDb2Tree } from "./CICSDb2Tree";
import { getResource } from "@zowe/cics-for-zowe-cli";
import * as https from "https";
import { getDefaultDb2DefinitionFilter, toEscapedCriteriaString } from "../../utils/filterUtils";
import { getIconPathInResources } from "../../utils/profileUtils";

export class CICSDb2DefinitionTree extends TreeItem {
  children: CICSDb2DefinitionTreeItem[] = [];
  parentRegion: CICSDb2Tree;
  activeFilter: string | undefined = undefined;

  constructor(
    parentRegion: CICSDb2Tree,
    public iconPath = getIconPathInResources("folder-closed-dark.svg", "folder-closed-light.svg")
  ) {
    super('Db2 Defintions', TreeItemCollapsibleState.Collapsed);
    this.contextValue = `cicstreedb2definition.${this.activeFilter ? 'filtered' : 'unfiltered'}.db2definitions`;
    this.parentRegion = parentRegion;
  }

  public addDb2Definition(program: CICSDb2DefinitionTreeItem) {
    this.children.push(program);
  }

  public async loadContents() {
    let defaultCriteria = await getDefaultDb2DefinitionFilter();
    let criteria;
    if (this.activeFilter) {
      criteria = toEscapedCriteriaString(this.activeFilter, 'name');
    } else {
      criteria = defaultCriteria;
    }
    this.children = [];
    try {

      https.globalAgent.options.rejectUnauthorized = this.parentRegion.parentSession.session.ISession.rejectUnauthorized;

      const db2definitionResponse = await getResource(this.parentRegion.parentSession.session, {
        name: "CICSDefinitionDb2Transaction",
        regionName: this.parentRegion.getRegionName(),
        cicsPlex: this.parentRegion.parentPlex ? this.parentRegion.parentPlex!.getPlexName() : undefined,
        criteria: "Name=*",
        parameter: "CSDGROUP(*)"
      });
      https.globalAgent.options.rejectUnauthorized = undefined;
      const db2definitionArray = Array.isArray(db2definitionResponse.response.records.cicsdefinitiondb2transaction) ? db2definitionResponse.response.records.cicsdefinitiondb2transaction : [db2definitionResponse.response.records.cicsdefinitiondb2transaction];
      this.label = `Db2 Definition${this.activeFilter?` (${this.activeFilter}) `: " "}[${db2definitionArray.length}]`;
      for (const db2definition of db2definitionArray) {
        const newDb2DefinitionItem = new CICSDb2DefinitionTreeItem(db2definition, this.parentRegion, this);
        this.addDb2Definition(newDb2DefinitionItem);
      }
      this.iconPath = getIconPathInResources("folder-open-dark.svg", "folder-open-light.svg");
    } catch (error) {
      https.globalAgent.options.rejectUnauthorized = undefined;
      // @ts-ignore
      if (error!.mMessage!.includes('exceeded a resource limit')) {
        window.showErrorMessage(`Resource Limit Exceeded - Set a definition filter to narrow search`);
        // @ts-ignore
      } else if (error!.mMessage!.split(" ").join("").includes('recordcount:0')) {
        window.showInformationMessage(`No Db2 definition found`);
        this.label = `Db2Definitions${this.activeFilter?` (${this.activeFilter}) `: " "}[0]`;
      } else {
        window.showErrorMessage(`Something went wrong when fetching db2 definition - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(/(\\n\t|\\n|\\t)/gm," ")}`);
      }
    }
  }

  public clearFilter() {
    this.activeFilter = undefined;
    this.contextValue = `cicstreedb2definition.${this.activeFilter ? 'filtered' : 'unfiltered'}.db2definitions`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public setFilter(newFilter: string) {
    this.activeFilter = newFilter;
    this.contextValue = `cicstreedb2definition.${this.activeFilter ? 'filtered' : 'unfiltered'}.db2definitions`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public getFilter() {
    return this.activeFilter;
  }

  public getParent() {
    return this.parentRegion;
  }
}
