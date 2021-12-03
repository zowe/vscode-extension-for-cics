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
import { join } from "path";
import { CICSPlexTree } from "./CICSPlexTree";
import { CICSRegionTree } from "./CICSRegionTree";
import { CICSTree } from "./CICSTree";
import { ProfileManagement } from "../utils/profileManagement";
import { ViewMore } from "./treeItems/utils/ViewMore";
import { CicsCmciConstants } from "@zowe/cics-for-zowe-cli";
import { CICSTransactionTreeItem } from "./treeItems/CICSTransactionTreeItem";
import { getDefaultTransactionFilter } from "../utils/getDefaultTransactionFilter";

export class CICSCombinedTransactionsTree extends TreeItem {
  children: (CICSTransactionTreeItem | ViewMore) [] | null;
  parentPlex: CICSPlexTree;
  activeFilter: string | undefined;
  currentCount: number;
  incrementCount: number;
  constant: string;

  constructor(
    parentPlex: CICSPlexTree,
    public iconPath = {
      light: join(
        __filename,
        "..",
        "..",
        "..",
        "resources",
        "imgs",
        "transactions-dark.svg"
      ),
      dark: join(
        __filename,
        "..",
        "..",
        "..",
        "resources",
        "imgs",
        "transactions-light.svg"
      ),
    }
  ) {
    super("All Local Transactions", TreeItemCollapsibleState.Collapsed);
    this.contextValue = `cicscombinedtransactiontree.`;
    this.parentPlex = parentPlex;
    this.children = [];
    this.activeFilter = undefined;
    this.currentCount = 0;
    this.incrementCount = 2;
    this.constant = CicsCmciConstants.CICS_LOCAL_TRANSACTION;
    }

    public async loadContents(tree : CICSTree){
      window.withProgress({
        title: 'Loading Local Transactions',
        location: ProgressLocation.Notification,
        cancellable: true
      }, async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the load");
        });
        let defaultCriteria = await getDefaultTransactionFilter();
        let count;
        const cacheTokenInfo = await ProfileManagement.generateCacheToken(this.parentPlex.getProfile(),this.parentPlex.getPlexName(),this.constant,defaultCriteria);
        if (cacheTokenInfo) {
          const recordsCount = cacheTokenInfo.recordCount;
          let allLocalTransactions;
          // need to change number
          if (recordsCount <= 3000) {
            allLocalTransactions = await ProfileManagement.getAllResourcesInPlex(this.parentPlex, this.constant, defaultCriteria);
          } else {
            allLocalTransactions = await ProfileManagement.getCachedResources(this.parentPlex.getProfile(), cacheTokenInfo.cacheToken, this.constant, 1, this.incrementCount);
            count = parseInt(recordsCount);
          }
          if (allLocalTransactions) {
            this.addLocalTransactionsUtil([], allLocalTransactions, count);
            tree._onDidChangeTreeData.fire(undefined);
          } else {
            window.showErrorMessage('Something went wrong when fetching all local transactions');
          }
        }
        }
      );
    }

    public addLocalTransactionsUtil(newChildren:(CICSTransactionTreeItem | ViewMore) [], allLocalTransactions:any, count:number|undefined){
      for (const transaction of allLocalTransactions) {
        const parentRegion = this.parentPlex.children.filter(child => {
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
      this.label = `All Local Transactions [${this.currentCount} of ${count}]`;
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
        const cacheTokenInfo = await ProfileManagement.generateCacheToken(this.parentPlex.getProfile(),this.parentPlex.getPlexName(),this.constant);
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
              this.addLocalTransactionsUtil(this.children ? this.children?.filter((child)=> child instanceof CICSTransactionTreeItem):[], allLocalTransactions, count);
              tree._onDidChangeTreeData.fire(undefined);
            }
          }
        });
    }

    public clearFilter() {
      this.activeFilter = undefined;
      // this.contextValue = `cicstreeprogram.${this.activeFilter ? 'filtered' : 'unfiltered'}.programs`;
      this.label = `All Local Transactions`;
      this.collapsibleState = TreeItemCollapsibleState.Expanded;
    }
  
    public setFilter(newFilter: string) {
      this.activeFilter = newFilter;
      // this.contextValue = `cicstreeprogram.${this.activeFilter ? 'filtered' : 'unfiltered'}.programs`;
      this.label = `All Local Transactions (${this.activeFilter})`;
      this.collapsibleState = TreeItemCollapsibleState.Expanded;
    }
}