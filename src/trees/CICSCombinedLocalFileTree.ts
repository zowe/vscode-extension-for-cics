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
import { CICSLocalFileTreeItem } from "./treeItems/CICSLocalFileTreeItem";
import { toEscapedCriteriaString } from "../utils/toEscapedCriteriaString";
import { CICSRegionsContainer } from "./CICSRegionsContainer";
import { TextTreeItem } from "./treeItems/utils/TextTreeItem";
import { getIconPathInResources } from "../utils/getIconPath";

export class CICSCombinedLocalFileTree extends TreeItem {
  children: (CICSLocalFileTreeItem | ViewMore) [] | [TextTreeItem] | null;
  parentPlex: CICSPlexTree;
  activeFilter: string | undefined;
  currentCount: number;
  incrementCount: number;
  constant: string;

  constructor(
    parentPlex: CICSPlexTree,
    public iconPath = getIconPathInResources("folder-closed-dark.svg", "folder-closed-light.svg")
  ) {
    super("All Local Files", TreeItemCollapsibleState.Collapsed);
    this.contextValue = `cicscombinedlocalfiletree.`;
    this.parentPlex = parentPlex;
    this.children = [new TextTreeItem("Use the search button to display local files", "applyfiltertext.")];
    this.activeFilter = undefined;
    this.currentCount = 0;
    this.incrementCount = 500;
    this.constant = "CICSLocalFile";
    }

    public async loadContents(tree: CICSTree){
      window.withProgress({
        title: 'Loading Local Files',
        location: ProgressLocation.Notification,
        cancellable: true
      }, async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the load");
        });
        let criteria;
        if (this.activeFilter) {
          criteria = toEscapedCriteriaString(this.activeFilter, 'file');
        }
        let count;
        try {
          const cacheTokenInfo = await ProfileManagement.generateCacheToken(
            this.parentPlex.getProfile(),
            this.parentPlex.getPlexName(),
            this.constant,
            criteria,
            this.getParent().getGroupName()
            );
          if (cacheTokenInfo) {
            const recordsCount = cacheTokenInfo.recordCount;
            if (parseInt(recordsCount, 10)) {
              let allLocalFiles;
              if (recordsCount <= 500) {
                allLocalFiles = await ProfileManagement.getCachedResources(
                  this.parentPlex.getProfile(),
                  cacheTokenInfo.cacheToken,
                  this.constant,
                  1,
                  parseInt(recordsCount, 10)
                  );
              } else {
                allLocalFiles = await ProfileManagement.getCachedResources(
                  this.parentPlex.getProfile(),
                  cacheTokenInfo.cacheToken,
                  this.constant,
                  1,
                  this.incrementCount
                  );
                count = parseInt(recordsCount);
              }
                this.addLocalFilesUtil([], allLocalFiles, count);
                this.iconPath = getIconPathInResources("folder-open-dark.svg", "folder-open-light.svg");
                tree._onDidChangeTreeData.fire(undefined);
            } else {
              this.children = [];
              this.iconPath = getIconPathInResources("folder-open-dark.svg", "folder-open-light.svg");
              tree._onDidChangeTreeData.fire(undefined);
              window.showInformationMessage(`No local files found`);
            }
          }
        } catch (error) {
          window.showErrorMessage(`Something went wrong when fetching local files - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(/(\\n\t|\\n|\\t)/gm," ")}`);
        }
        }
      );
    }

    public addLocalFilesUtil(newChildren:(CICSLocalFileTreeItem | ViewMore) [], allLocalFiles:any, count:number|undefined){
      for (const localfile of allLocalFiles) {
        const regionsContainer = this.parentPlex.children.filter(child => {
          if (child instanceof CICSRegionsContainer) {
            return child;
          }
        })[0];
        //@ts-ignore
        const parentRegion = regionsContainer.getChildren().filter(child => {
          if (child instanceof CICSRegionTree) {
            return child.getRegionName() === localfile.eyu_cicsname;
          }
        })[0];
        //@ts-ignore
        const localFileTree = new CICSLocalFileTreeItem(localfile,parentRegion);
        localFileTree.setLabel(localFileTree.label!.toString().replace(localfile.file, `${localfile.file} (${localfile.eyu_cicsname})`));
        newChildren.push(localFileTree);
      }
      if (!count) {
        count = newChildren.length;
      }
      this.currentCount = newChildren.length;
      this.label = `All Local Files ${this.activeFilter?`(${this.activeFilter}) `: " "}[${this.currentCount} of ${count}]`;
      if (count !== this.currentCount) {
        newChildren.push(new ViewMore(this, Math.min(this.incrementCount, count-this.currentCount)));
      }
      this.children = newChildren;
    }

    public async addMoreCachedResources(tree: CICSTree) {
      window.withProgress({
        title: 'Loading more local files',
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
            const allLocalFiles = await ProfileManagement.getCachedResources(
              this.parentPlex.getProfile(),
              cacheTokenInfo.cacheToken,
              this.constant,
              this.currentCount+1,
              this.incrementCount
              );
            if (allLocalFiles) {
              // @ts-ignore
              this.addLocalFilesUtil(this.getChildren() ? this.getChildren().filter((child) => child instanceof CICSLocalFileTreeItem):[], allLocalFiles, count);
              tree._onDidChangeTreeData.fire(undefined);
            }
          }
        });
    }

    public clearFilter() {
      this.activeFilter = undefined;
      this.label = `All Local Files`;
      this.contextValue = `cicscombinedlocalfiletree.unfiltered`;
      this.collapsibleState = TreeItemCollapsibleState.Expanded;
    }
  
    public setFilter(newFilter: string) {
      this.activeFilter = newFilter;
      this.label = `All Local Files (${this.activeFilter})`;
      this.contextValue = `cicscombinedlocalfiletree.filtered`;
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