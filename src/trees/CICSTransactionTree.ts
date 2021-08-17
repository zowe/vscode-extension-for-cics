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

import { TreeItemCollapsibleState, TreeItem, window, workspace } from "vscode";
import { join } from "path";
import { CICSTransactionTreeItem } from "./treeItems/CICSTransactionTreeItem";
import { CICSRegionTree } from "./CICSRegionTree";
import { getResource } from "@zowe/cics-for-zowe-cli";

export class CICSTransactionTree extends TreeItem {
  children: CICSTransactionTreeItem[] = [];
  parentRegion: CICSRegionTree;
  activeFilter: string | undefined = undefined;

  constructor(
    parentRegion: CICSRegionTree,
    public readonly iconPath = {
      light: join(
        __filename,
        "..",
        "..",
        "..",
        "resources",
        "imgs",
        "list-alt-dark.svg"
      ),
      dark: join(
        __filename,
        "..",
        "..",
        "..",
        "resources",
        "imgs",
        "list-alt-light.svg"
      ),
    }
  ) {
    super('Transactions', TreeItemCollapsibleState.Collapsed);
    this.contextValue = `cicstreetransaction.${this.activeFilter ? 'filtered' : 'unfiltered'}.transactions`;
    this.parentRegion = parentRegion;
  }

  public addTransaction(program: CICSTransactionTreeItem) {
    this.children.push(program);
  }

  public async loadContents() {
    let defaultCriteria = `${await workspace.getConfiguration().get('Zowe.CICS.Transaction.Filter')}`;
    if (!defaultCriteria || defaultCriteria.length === 0) {
      await workspace.getConfiguration().update('Zowe.CICS.Transaction.Filter', 'NOT (program=DFH* OR program=EYU*)');
      defaultCriteria = 'NOT (program=DFH* OR program=EYU*)';
    }
    const criteria = this.activeFilter ? `tranid=${this.activeFilter}` : defaultCriteria;

    this.children = [];
    try {
      const transactionResponse = await getResource(this.parentRegion.parentSession.session, {
        name: "CICSLocalTransaction",
        regionName: this.parentRegion.getRegionName(),
        cicsPlex: this.parentRegion.parentPlex ? this.parentRegion.parentPlex!.getPlexName() : undefined,
        criteria: criteria
      });
      for (const transaction of Array.isArray(transactionResponse.response.records.cicslocaltransaction) ? transactionResponse.response.records.cicslocaltransaction : [transactionResponse.response.records.cicslocaltransaction]) {
        const newTransactionItem = new CICSTransactionTreeItem(transaction, this.parentRegion);
        //@ts-ignore
        this.addTransaction(newTransactionItem);
      }
    } catch (error) {
      window.showInformationMessage(`No results`);
    }
  }

  public clearFilter() {
    this.activeFilter = undefined;
    this.contextValue = `cicstreetransaction.${this.activeFilter ? 'filtered' : 'unfiltered'}.transactions`;
    this.label = `Transactions`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public setFilter(newFilter: string) {
    this.activeFilter = newFilter;
    this.contextValue = `cicstreetransaction.${this.activeFilter ? 'filtered' : 'unfiltered'}.transactions`;
    this.label = `Transactions (${this.activeFilter})`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }
}
