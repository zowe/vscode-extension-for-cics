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
import { CICSTransactionTreeItem } from "./treeItems/CICSTransactionTreeItem";
import { CICSRegionTree } from "./CICSRegionTree";
import { getResource } from "@zowe/cics-for-zowe-cli";
import * as https from "https";
import { getDefaultTransactionFilter } from "../utils/getDefaultTransactionFilter";
import { toEscapedCriteriaString } from "../utils/toEscapedCriteriaString";
import { getIconPathInResources } from "../utils/getIconPath";

export class CICSTransactionTree extends TreeItem {
  children: CICSTransactionTreeItem[] = [];
  parentRegion: CICSRegionTree;
  activeFilter: string | undefined = undefined;

  constructor(
    parentRegion: CICSRegionTree,
    public iconPath = getIconPathInResources("folder-closed-dark.svg", "folder-closed-light.svg")
  ) {
    super('Transactions', TreeItemCollapsibleState.Collapsed);
    this.contextValue = `cicstreetransaction.${this.activeFilter ? 'filtered' : 'unfiltered'}.transactions`;
    this.parentRegion = parentRegion;
  }

  public addTransaction(program: CICSTransactionTreeItem) {
    this.children.push(program);
  }

  public async loadContents() {
    let defaultCriteria = await getDefaultTransactionFilter();
    let criteria;
    if (this.activeFilter) {
      criteria = toEscapedCriteriaString(this.activeFilter, 'tranid');
    } else {
      criteria = defaultCriteria;
    }
    this.children = [];
    try {

      https.globalAgent.options.rejectUnauthorized = this.parentRegion.parentSession.session.ISession.rejectUnauthorized;

      const transactionResponse = await getResource(this.parentRegion.parentSession.session, {
        name: "CICSLocalTransaction",
        regionName: this.parentRegion.getRegionName(),
        cicsPlex: this.parentRegion.parentPlex ? this.parentRegion.parentPlex!.getPlexName() : undefined,
        criteria: criteria
      });
      https.globalAgent.options.rejectUnauthorized = undefined;
      const transactionArray = Array.isArray(transactionResponse.response.records.cicslocaltransaction) ? transactionResponse.response.records.cicslocaltransaction : [transactionResponse.response.records.cicslocaltransaction];
      this.label = `Transactions${this.activeFilter?` (${this.activeFilter}) `: " "}[${transactionArray.length}]`;
      for (const transaction of transactionArray) {
        const newTransactionItem = new CICSTransactionTreeItem(transaction, this.parentRegion);
        //@ts-ignore
        this.addTransaction(newTransactionItem);
      }
      this.iconPath = getIconPathInResources("folder-open-dark.svg", "folder-open-light.svg");
    } catch (error) {
      https.globalAgent.options.rejectUnauthorized = undefined;
      // @ts-ignore
      if (error!.mMessage!.includes('exceeded a resource limit')) {
        window.showErrorMessage(`Resource Limit Exceeded - Set a transaction filter to narrow search`);
        // @ts-ignore
      } else if (error!.mMessage!.split(" ").join("").includes('recordcount:0')) {
        window.showInformationMessage(`No transactions found`);
      } else {
        window.showErrorMessage(`Something went wrong when fetching transaction - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(/(\\n\t|\\n|\\t)/gm," ")}`);
      }
    }
  }

  public clearFilter() {
    this.activeFilter = undefined;
    this.contextValue = `cicstreetransaction.${this.activeFilter ? 'filtered' : 'unfiltered'}.transactions`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public setFilter(newFilter: string) {
    this.activeFilter = newFilter;
    this.contextValue = `cicstreetransaction.${this.activeFilter ? 'filtered' : 'unfiltered'}.transactions`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public getFilter() {
    return this.activeFilter;
  }
}
