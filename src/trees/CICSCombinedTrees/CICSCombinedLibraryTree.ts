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

import { TreeItemCollapsibleState, TreeItem, window, ProgressLocation, workspace } from "vscode";
import { CICSPlexTree } from "../CICSPlexTree";
import { CICSLibraryTreeItem } from "../treeItems/CICSLibraryTreeItem";
import { CICSRegionTree } from "../CICSRegionTree";
import { CICSTree } from "../CICSTree";
import { ProfileManagement } from "../../utils/profileManagement";
import { ViewMore } from "../treeItems/utils/ViewMore";
import { CicsCmciConstants } from "@zowe/cics-for-zowe-cli";
import { toEscapedCriteriaString } from "../../utils/filterUtils";
import { CICSRegionsContainer } from "../CICSRegionsContainer";
import { TextTreeItem } from "../treeItems/utils/TextTreeItem";
import { getIconPathInResources } from "../../utils/profileUtils";

export class CICSCombinedLibraryTree extends TreeItem {
  children: (CICSLibraryTreeItem | ViewMore ) [] | [TextTreeItem] | null;
  parentPlex: CICSPlexTree;
  activeFilter: string | undefined;
  currentCount: number;
  incrementCount: number;
  constant: string;

  constructor(
    parentPlex: CICSPlexTree,
    public iconPath = getIconPathInResources("folder-closed-dark.svg", "folder-closed-light.svg")
  ) {
    super("All Libraries", TreeItemCollapsibleState.Collapsed);
    this.contextValue = `cicscombinedlibrarytree.`;
    this.parentPlex = parentPlex;
    this.children = [new TextTreeItem("Use the search button to display libraries", "applyfiltertext.")];
    this.activeFilter = undefined;
    this.currentCount = 0;
    this.incrementCount = +`${workspace.getConfiguration().get('zowe.cics.allLibraries.recordCountIncrement')}`;
    this.constant = "CICSLibrary";
    }

    public async loadContents(tree: CICSTree){
      window.withProgress({
        title: 'Loading Libraries',
        location: ProgressLocation.Notification,
        cancellable: true
      }, async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the load");
        });
        try {
          let criteria;
          if (this.activeFilter) {
            criteria = toEscapedCriteriaString(this.activeFilter, 'NAME');
          }
          let count;
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
              let allLibraries;
              if (recordsCount <= this.incrementCount) {
                allLibraries = await ProfileManagement.getCachedResources(this.parentPlex.getProfile(), cacheTokenInfo.cacheToken, this.constant, 1, parseInt(recordsCount, 10));
              } else {
                allLibraries = await ProfileManagement.getCachedResources(this.parentPlex.getProfile(), cacheTokenInfo.cacheToken, this.constant, 1, this.incrementCount);
                count = parseInt(recordsCount);
              }
              this.addLibrariesUtil([], allLibraries, count);
              this.iconPath = getIconPathInResources("folder-open-dark.svg", "folder-open-light.svg");
              tree._onDidChangeTreeData.fire(undefined);
            } else {
              this.children = [];
              this.iconPath = getIconPathInResources("folder-open-dark.svg", "folder-open-light.svg");
              tree._onDidChangeTreeData.fire(undefined);
              window.showInformationMessage(`No libraries found`);
              this.label = `All Libraries${this.activeFilter?` (${this.activeFilter}) `: " "}[${recordsCount}]`;
            }
          }
        } catch (error) {
          window.showErrorMessage(`Something went wrong when fetching libraries - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(/(\\n\t|\\n|\\t)/gm," ")}`);
        }
        }
      );
    }

    public addLibrariesUtil(newChildren:(CICSLibraryTreeItem | ViewMore) [], allLibraries:any, count:number|undefined){
      for (const library of allLibraries) {
        // Regions container must exist if all libraries tree exists
        const regionsContainer = this.parentPlex.children.filter(child => {
          if (child instanceof CICSRegionsContainer) {
            return child;
          }
        })[0];
        const parentRegion = regionsContainer.getChildren()!.filter(child => {
          if (child instanceof CICSRegionTree) {
            return child.getRegionName() === library.eyu_cicsname;
          }
        })[0] as CICSRegionTree;
        const libraryTree = new CICSLibraryTreeItem(library,parentRegion, this);
        libraryTree.setLabel(libraryTree.label!.toString().replace(library.name, `${library.name} (${library.eyu_cicsname})`));
        newChildren.push(libraryTree);
      }
      if (!count) {
        count = newChildren.length;
      }
      this.currentCount = newChildren.length;
      this.label = `All Libraries ${this.activeFilter?`(${this.activeFilter}) `: " "}[${this.currentCount} of ${count}]`;
      if (count !== this.currentCount) {
        newChildren.push(new ViewMore(this, Math.min(this.incrementCount, count-this.currentCount)));
      }
      this.children = newChildren;
    }

    public async addMoreCachedResources(tree: CICSTree) {
      window.withProgress({
        title: 'Loading more libraries',
        location: ProgressLocation.Notification,
        cancellable: false
      }, async () => {
          let criteria;
          if (this.activeFilter) {
            criteria = toEscapedCriteriaString(this.activeFilter, 'NAME');
          }
          const cacheTokenInfo = await ProfileManagement.generateCacheToken(
            this.parentPlex.getProfile(),
            this.parentPlex.getPlexName(),
            this.constant,
            criteria,
            this.getParent().getGroupName()
            );
          if (cacheTokenInfo) {
            // record count may have updated
            const recordsCount = cacheTokenInfo.recordCount;
            const count = parseInt(recordsCount);
            const allLibraries = await ProfileManagement.getCachedResources(
              this.parentPlex.getProfile(),
              cacheTokenInfo.cacheToken,
              this.constant,
              this.currentCount+1,
              this.incrementCount
              );
            if (allLibraries) {
              // @ts-ignore
              this.addLibrariesUtil(this.getChildren() ? this.getChildren().filter((child) => child instanceof CICSLibraryTreeItem):[], 
                allLibraries,
                count
                );
              tree._onDidChangeTreeData.fire(undefined);
            }
          }
        });
    }

    public clearFilter() {
      this.activeFilter = undefined;
      this.label = `All Libraries`;
      this.contextValue = `cicscombinedlibrarytree.unfiltered`;
      this.collapsibleState = TreeItemCollapsibleState.Expanded;
    }
  
    public setFilter(newFilter: string) {
      this.activeFilter = newFilter;
      this.label = `All Libraries (${this.activeFilter})`;
      this.contextValue = `cicscombinedlibrarytree.filtered`;
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