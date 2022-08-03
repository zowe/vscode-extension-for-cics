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
import { CICSDb2TransactionDefinitionTreeItem } from "../treeItems/CICSDb2TransactionDefinitionTreeItem";
import { CICSDb2Tree } from "./CICSDb2Tree";
import { getResource } from "@zowe/cics-for-zowe-cli";
import * as https from "https";
import { getDefaultDb2TransactionDefinitionFilter, toEscapedCriteriaString } from "../../utils/filterUtils";
import { getIconPathInResources } from "../../utils/profileUtils";

export class CICSDb2TransactionDefinitionTree extends TreeItem {
  children: CICSDb2TransactionDefinitionTreeItem[] = [];
  parentRegion: CICSDb2Tree;
  activeFilter: string | undefined = undefined;

  constructor(
    parentRegion: CICSDb2Tree,
    public iconPath = getIconPathInResources("folder-closed-dark.svg", "folder-closed-light.svg")
  ) {
    super('Db2 Transaction Definitions', TreeItemCollapsibleState.Collapsed);
    this.contextValue = `cicstreedb2transactiondefinition.${this.activeFilter ? 'filtered' : 'unfiltered'}.db2transactiondefinitions`;
    this.parentRegion = parentRegion;
  }

  public addDb2TransactionDefinition(program: CICSDb2TransactionDefinitionTreeItem) {
    this.children.push(program);
  }

  public async loadContents() {
    let defaultCriteria = await getDefaultDb2TransactionDefinitionFilter();
    let criteria;
    if (this.activeFilter) {
      criteria = toEscapedCriteriaString(this.activeFilter, 'name');
    } else {
      criteria = defaultCriteria;
    }
    this.children = [];
    try {

      https.globalAgent.options.rejectUnauthorized = this.parentRegion.parentSession.session.ISession.rejectUnauthorized;

      const db2transactiondefinitionResponse = await getResource(this.parentRegion.parentSession.session, {
        name: "CICSDefinitionDb2Transaction",
        regionName: this.parentRegion.getRegionName(),
        cicsPlex: this.parentRegion.parentPlex ? this.parentRegion.parentPlex!.getPlexName() : undefined,
        criteria: criteria,
        parameter: "CSDGROUP(*)"
      });
      https.globalAgent.options.rejectUnauthorized = undefined;
      const db2transactiondefinitionArray = Array.isArray(db2transactiondefinitionResponse.response.records.cicsdefinitiondb2transaction) ? db2transactiondefinitionResponse.response.records.cicsdefinitiondb2transaction : [db2transactiondefinitionResponse.response.records.cicsdefinitiondb2transaction];
      this.label = `Db2 Transaction Definitions${this.activeFilter?` (${this.activeFilter}) `: " "}[${db2transactiondefinitionArray.length}]`;
      for (const db2transactiondefinition of db2transactiondefinitionArray) {
        const newDb2TransactionDefinitionItem = new CICSDb2TransactionDefinitionTreeItem(db2transactiondefinition, this.parentRegion, this);
        this.addDb2TransactionDefinition(newDb2TransactionDefinitionItem);
      }
      this.iconPath = getIconPathInResources("folder-open-dark.svg", "folder-open-light.svg");
    } catch (error) {
      https.globalAgent.options.rejectUnauthorized = undefined;
      // @ts-ignore
      if (error!.mMessage!.includes('exceeded a resource limit')) {
        window.showErrorMessage(`Resource Limit Exceeded - Set a transaction definition filter to narrow search`);
        // @ts-ignore
      } else if (error!.mMessage!.split(" ").join("").includes('recordcount:0')) {
        window.showInformationMessage(`No Db2 definition found`);
        this.label = `Db2 Transaction Definitions${this.activeFilter?` (${this.activeFilter}) `: " "}[0]`;
      } else {
        window.showErrorMessage(`Something went wrong when fetching db2 transaction definition - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(/(\\n\t|\\n|\\t)/gm," ")}`);
      }
    }
  }

  public clearFilter() {
    this.activeFilter = undefined;
    this.contextValue = `cicstreedb2transactiondefinition.${this.activeFilter ? 'filtered' : 'unfiltered'}.db2transactiondefinitions`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public setFilter(newFilter: string) {
    this.activeFilter = newFilter;
    this.contextValue = `cicstreedb2transactiondefinition.${this.activeFilter ? 'filtered' : 'unfiltered'}.db2transactiondefinitions`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public getFilter() {
    return this.activeFilter;
  }

  public getParent() {
    return this.parentRegion;
  }
}
