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

import { TreeItemCollapsibleState, TreeItem, window, ProgressLocation } from "vscode";
import { CICSPlexTree } from "./CICSPlexTree";
import { CICSRegionTree } from "./CICSRegionTree";
import { CICSTree } from "./CICSTree";
import { ProfileManagement } from "../utils/profileManagement";
import { ViewMore } from "./treeItems/utils/ViewMore";
import { CicsCmciConstants } from "@zowe/cics-for-zowe-cli";
import { CICSTransactionTreeItem } from "./treeItems/CICSTransactionTreeItem";
import { toEscapedCriteriaString } from "../utils/toEscapedCriteriaString";
import { CICSRegionsContainer } from "./CICSRegionsContainer";
import { TextTreeItem } from "./treeItems/utils/TextTreeItem";
import { getIconPathInResources } from "../utils/getIconPath";

export class CICSCombinedTransactionsTree extends TreeItem {
  children: (CICSTransactionTreeItem | ViewMore) [] | [TextTreeItem] | null;
  parentPlex: CICSPlexTree;
  activeFilter: string | undefined;
  currentCount: number;
  incrementCount: number;
  constant: string;

  constructor(
    parentPlex: CICSPlexTree,
    public iconPath = getIconPathInResources("folder-closed-dark.svg", "folder-closed-light.svg")
  ) {
    super("All Local Transactions", TreeItemCollapsibleState.Collapsed);
    this.contextValue = `cicscombinedtransactiontree.`;
    this.parentPlex = parentPlex;
    this.children = [new TextTreeItem("Use the search button to display local transactions", "applyfiltertext.")];
    this.activeFilter = undefined;
    this.currentCount = 0;
    this.incrementCount = 500;
    this.constant = CicsCmciConstants.CICS_LOCAL_TRANSACTION;
    }

    public async loadContents(tree: CICSTree){
      window.withProgress({
        title: 'Loading Local Transactions',
        location: ProgressLocation.Notification,
        cancellable: true
      }, async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the load");
        });
        try {
          let criteria;
          if (this.activeFilter) {
            criteria = toEscapedCriteriaString(this.activeFilter, 'tranid');
          }
          let count;
          const cacheTokenInfo = await ProfileManagement.generateCacheToken(
            this.parentPlex.getProfile(),
            this.parentPlex.getPlexName(),
            this.constant, criteria,
            this.getParent().getGroupName()
            );
          if (cacheTokenInfo) {
            const recordsCount = cacheTokenInfo.recordCount;
            if (parseInt(recordsCount, 10)) {
              let allLocalTransactions;
              if (recordsCount <= 500) {
                allLocalTransactions = await ProfileManagement.getCachedResources(this.parentPlex.getProfile(), cacheTokenInfo.cacheToken, this.constant, 1, parseInt(recordsCount, 10));
              } else {
                allLocalTransactions = await ProfileManagement.getCachedResources(this.parentPlex.getProfile(), cacheTokenInfo.cacheToken, this.constant, 1, this.incrementCount);
                count = parseInt(recordsCount);
              }
              this.addLocalTransactionsUtil([], allLocalTransactions, count);
              this.iconPath = getIconPathInResources("folder-open-dark.svg", "folder-open-light.svg");
              tree._onDidChangeTreeData.fire(undefined);
            } else {
              this.children = [];
              this.iconPath = getIconPathInResources("folder-open-dark.svg", "folder-open-light.svg");
              tree._onDidChangeTreeData.fire(undefined);
              window.showInformationMessage(`No local transactions found`);
            }
          }
        } catch (error) {
          window.showErrorMessage(`Something went wrong when fetching local transactions - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(/(\\n\t|\\n|\\t)/gm," ")}`);
        }
        }
      );
    }

    public addLocalTransactionsUtil(newChildren:(CICSTransactionTreeItem | ViewMore) [], allLocalTransactions:any, count:number|undefined){
      for (const transaction of allLocalTransactions) {
        const regionsContainer = this.parentPlex.children.filter(child => {
          if (child instanceof CICSRegionsContainer) {
            return child;
          }
        })[0];
        //@ts-ignore
        const parentRegion = regionsContainer.getChildren().filter(child => {
          if (child instanceof CICSRegionTree) {
            return child.getRegionName() === transaction.eyu_cicsname;
          }
        })[0];
        //@ts-ignore
        const transactionTree = new CICSTransactionTreeItem(transaction,parentRegion);
        transactionTree.setLabel(transactionTree.label!.toString().replace(transaction.tranid, `${transaction.tranid} (${transaction.eyu_cicsname})`));
        newChildren.push(transactionTree);
      }
      if (!count) {
        count = newChildren.length;
      }
      this.currentCount = newChildren.length;
      this.label = `All Local Transactions ${this.activeFilter?`(${this.activeFilter}) `: " "}[${this.currentCount} of ${count}]`;
      if (count !== this.currentCount) {
        newChildren.push(new ViewMore(this, Math.min(this.incrementCount, count-this.currentCount)));
      }
      this.children = newChildren;
    }

    public async addMoreCachedResources(tree: CICSTree) {
      window.withProgress({
        title: 'Loading more local transactions',
        location: ProgressLocation.Notification,
        cancellable: false
      }, async () => {
        const cacheTokenInfo = await ProfileManagement.generateCacheToken(
          this.parentPlex.getProfile(),
          this.parentPlex.getPlexName(),
          this.constant,
          this.getParent().getGroupName()
          );
          if (cacheTokenInfo) {
            // record count may have updated
            const recordsCount = cacheTokenInfo.recordCount;
            const count = parseInt(recordsCount);
            const allLocalTransactions = await ProfileManagement.getCachedResources(
              this.parentPlex.getProfile(),
              cacheTokenInfo.cacheToken,
              this.constant,
              this.currentCount+1,
              this.incrementCount
              );
            if (allLocalTransactions) {
              // @ts-ignore
              this.addLocalTransactionsUtil(this.getChildren() ? this.getChildren().filter((child) => child instanceof CICSTransactionTreeItem) : [],
              allLocalTransactions,
              count
              );
              tree._onDidChangeTreeData.fire(undefined);
            }
          }
        });
    }

    public clearFilter() {
      this.activeFilter = undefined;
      this.label = `All Local Transactions`;
      this.contextValue = `cicscombinedtransactiontree.unfiltered`;
      this.collapsibleState = TreeItemCollapsibleState.Expanded;
    }
  
    public setFilter(newFilter: string) {
      this.activeFilter = newFilter;
      this.label = `All Local Transactions (${this.activeFilter})`;
      this.contextValue = `cicscombinedtransactiontree.filtered`;
      this.collapsibleState = TreeItemCollapsibleState.Expanded;
    }

    public getChildren() {
      return this.children ? this.children.filter(child => !(child instanceof TextTreeItem)) : [];
    }

    public getActiveFilter() {
      return this.activeFilter;
    }

    public getParent() {
      return this.parentPlex;
    }
}