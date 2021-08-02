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
import { CICSProgramTreeItem } from "./treeItems/CICSProgramTreeItem";
import { CICSRegionTree } from "./CICSRegionTree";
import { getResource } from "@zowe/cics-for-zowe-cli";
import { CICSProgramDefinitionTreeItem } from "./treeItems/CICSProgramDefinitionTreeItem";
import { CICSTransactionDefinitionTreeItem } from "./treeItems/CICSTransactionDefinitionTreeItem";
import { CICSTransactionTreeItem } from "./treeItems/CICSTransactionTreeItem";

export class CICSTransactionDefinitionTree extends TreeItem {
  children: CICSTransactionDefinitionTreeItem[] = [];
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
        "list-dark.svg"
      ),
      dark: join(
        __filename,
        "..",
        "..",
        "..",
        "resources",
        "imgs",
        "list-light.svg"
      ),
    }
  ) {
    super('Transactions', TreeItemCollapsibleState.Collapsed);
    this.contextValue = `cicstreedefinitiontransaction.${this.activeFilter ? 'filtered' : 'unfiltered'}.transactions`;
    this.parentRegion = parentRegion;
  }

  public addTransactionDefinition(transaction: CICSTransactionDefinitionTreeItem) {
    this.children.push(transaction);
  }

  public async loadContents() {
    try {
      const transactionResponse = await getResource(this.parentRegion.parentSession.session, {
        name: "CICSDefinitionTransaction",
        regionName: this.parentRegion.getRegionName(),
        cicsPlex: this.parentRegion.parentPlex ? this.parentRegion.parentPlex!.getPlexName() : undefined,
        criteria: this.activeFilter ? `NAME=${this.activeFilter}` : undefined,
        parameter: "CSDGROUP(*)"
      });

      this.children = [];
      for (const transaction of Array.isArray(transactionResponse.response.records.cicsdefinitiontransaction) ? transactionResponse.response.records.cicsdefinitiontransaction : [transactionResponse.response.records.cicsdefinitiontransaction]) {
        const newTransactionDefinitionItem = new CICSTransactionDefinitionTreeItem(transaction, this.parentRegion);
        //@ts-ignore
        this.addTransactionDefinition(newTransactionDefinitionItem);
      }
    } catch (error) {
      console.log(error);
    }
  }

  public clearFilter() {
    this.activeFilter = undefined;
    this.contextValue = `cicstreedefinitiontransaction.${this.activeFilter ? 'filtered' : 'unfiltered'}.transactions`;
    this.label = `Transactions`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public setFilter(newFilter: string) {
    this.activeFilter = newFilter;
    this.contextValue = `cicstreedefinitiontransaction.${this.activeFilter ? 'filtered' : 'unfiltered'}.transactions`;
    this.label = `Transactions (${this.activeFilter})`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }
}
