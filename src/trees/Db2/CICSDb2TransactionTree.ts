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
import { CICSDb2TransactionTreeItem } from "../treeItems/CICSDb2TransactionTreeItem";
import { CICSDb2Tree } from "./CICSDb2Tree";
import { getResource } from "@zowe/cics-for-zowe-cli";
import * as https from "https";
import { getDefaultDb2TransactionFilter, toEscapedCriteriaString } from "../../utils/filterUtils";
import { getIconPathInResources } from "../../utils/profileUtils";

export class CICSDb2TransactionTree extends TreeItem {
  children: CICSDb2TransactionTreeItem[] = [];
  parentRegion: CICSDb2Tree;
  activeFilter: string | undefined = undefined;

  constructor(
    parentRegion: CICSDb2Tree,
    public iconPath = getIconPathInResources("folder-closed-dark.svg", "folder-closed-light.svg")
  ) {
    super('Db2 Transactions', TreeItemCollapsibleState.Collapsed);
    this.contextValue = `cicstreedb2transaction.${this.activeFilter ? 'filtered' : 'unfiltered'}.db2transactions`;
    this.parentRegion = parentRegion;
  }

  public addDb2Transaction(program: CICSDb2TransactionTreeItem) {
    this.children.push(program);
  }

  public async loadContents() {
    let defaultCriteria = await getDefaultDb2TransactionFilter();
    let criteria;
    if (this.activeFilter) {
      criteria = toEscapedCriteriaString(this.activeFilter, 'name');
    } else {
      criteria = defaultCriteria;
    }
    this.children = [];
    try {

      https.globalAgent.options.rejectUnauthorized = this.parentRegion.parentSession.session.ISession.rejectUnauthorized;

      const db2transactionResponse = await getResource(this.parentRegion.parentSession.session, {
        name: "CICSDb2Transaction",
        regionName: this.parentRegion.getRegionName(),
        cicsPlex: this.parentRegion.parentPlex ? this.parentRegion.parentPlex!.getPlexName() : undefined,
        criteria: criteria
      });
      https.globalAgent.options.rejectUnauthorized = undefined;
      const db2transactionArray = Array.isArray(db2transactionResponse.response.records.cicsdb2transaction) ? db2transactionResponse.response.records.cicsdb2transaction : [db2transactionResponse.response.records.cicsdb2transaction];
      this.label = `Db2 Transactions${this.activeFilter?` (${this.activeFilter}) `: " "}[${db2transactionArray.length}]`;
      for (const db2transaction of db2transactionArray) {
        const newTransactionItem = new CICSDb2TransactionTreeItem(db2transaction, this.parentRegion, this);
        this.addDb2Transaction(newTransactionItem);
      }
      this.iconPath = getIconPathInResources("folder-open-dark.svg", "folder-open-light.svg");
    } catch (error) {
      https.globalAgent.options.rejectUnauthorized = undefined;
      // @ts-ignore
      if (error!.mMessage!.includes('exceeded a resource limit')) {
        window.showErrorMessage(`Resource Limit Exceeded - Set a transaction filter to narrow search`);
        // @ts-ignore
      } else if (error!.mMessage!.split(" ").join("").includes('recordcount:0')) {
        window.showInformationMessage(`No Db2 transactions found`);
        this.label = `Db2Transactions${this.activeFilter?` (${this.activeFilter}) `: " "}[0]`;
      } else {
        window.showErrorMessage(`Something went wrong when fetching db2 transaction - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(/(\\n\t|\\n|\\t)/gm," ")}`);
      }
    }
  }

  public clearFilter() {
    this.activeFilter = undefined;
    this.contextValue = `cicstreedb2transaction.${this.activeFilter ? 'filtered' : 'unfiltered'}.db2transactions`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public setFilter(newFilter: string) {
    this.activeFilter = newFilter;
    this.contextValue = `cicstreedb2transaction.${this.activeFilter ? 'filtered' : 'unfiltered'}.db2transactions`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public getFilter() {
    return this.activeFilter;
  }

  public getParent() {
    return this.parentRegion;
  }
}