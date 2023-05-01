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
import { CICSURIMapTreeItem } from "../treeItems/web/treeItems/CICSURIMapTreeItem";
import { CICSRegionTree } from "../CICSRegionTree";
import { CICSTree } from "../CICSTree";
import { ProfileManagement } from "../../utils/profileManagement";
import { ViewMore } from "../treeItems/utils/ViewMore";
import { CicsCmciConstants } from "@zowe/cics-for-zowe-cli";
import { toEscapedCriteriaString } from "../../utils/filterUtils";
import { CICSRegionsContainer } from "../CICSRegionsContainer";
import { TextTreeItem } from "../treeItems/utils/TextTreeItem";
import { getIconPathInResources } from "../../utils/profileUtils";

export class CICSCombinedURIMapTree extends TreeItem {
  children: (CICSURIMapTreeItem | ViewMore)[] | [TextTreeItem] | null;
  parentPlex: CICSPlexTree;
  activeFilter: string | undefined;
  currentCount: number;
  incrementCount: number;
  constant: string;

  constructor(parentPlex: CICSPlexTree, public iconPath = getIconPathInResources("folder-closed-dark.svg", "folder-closed-light.svg")) {
    super("All URI Maps", TreeItemCollapsibleState.Collapsed);
    this.contextValue = `cicscombinedurimapstree.`;
    this.parentPlex = parentPlex;
    this.children = [new TextTreeItem("Use the search button to display URI Maps", "applyfiltertext.")];
    this.activeFilter = undefined;
    this.currentCount = 0;
    this.incrementCount = +`${workspace.getConfiguration().get("zowe.cics.allURIMaps.recordCountIncrement")}`;
    this.constant = "CICSURIMap";
  }

  public async loadContents(tree: CICSTree) {
    await window.withProgress(
      {
        title: "Loading URI Maps",
        location: ProgressLocation.Notification,
        cancellable: true,
      },
      async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the load");
        });
        try {
          let criteria;
          if (this.activeFilter) {
            criteria = toEscapedCriteriaString(this.activeFilter, "NAME");
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
              let allURIMaps;
              if (recordsCount <= this.incrementCount) {
                allURIMaps = await ProfileManagement.getCachedResources(
                  this.parentPlex.getProfile(),
                  cacheTokenInfo.cacheToken,
                  this.constant,
                  1,
                  parseInt(recordsCount, 10)
                );
              } else {
                allURIMaps = await ProfileManagement.getCachedResources(
                  this.parentPlex.getProfile(),
                  cacheTokenInfo.cacheToken,
                  this.constant,
                  1,
                  this.incrementCount
                );
                count = parseInt(recordsCount);
              }
              this.addURIMapsUtil([], allURIMaps, count);
              this.iconPath = getIconPathInResources("folder-open-dark.svg", "folder-open-light.svg");
              tree._onDidChangeTreeData.fire(undefined);
            } else {
              this.children = [];
              this.iconPath = getIconPathInResources("folder-open-dark.svg", "folder-open-light.svg");
              tree._onDidChangeTreeData.fire(undefined);
              window.showInformationMessage(`No URI Maps found`);
              this.label = `All URI Maps ${this.activeFilter ? ` (${this.activeFilter}) ` : " "}[${recordsCount}]`;
            }
          }
        } catch (error) {
          window.showErrorMessage(
            `Something went wrong when fetching URI Maps - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(
              /(\\n\t|\\n|\\t)/gm,
              " "
            )}`
          );
        }
      }
    );
  }

  public addURIMapsUtil(newChildren: (CICSURIMapTreeItem | ViewMore)[], allURIMaps: any, count: number | undefined) {
    for (const urimaps of allURIMaps) {
      // Regions container must exist if all URI Maps tree exists
      const regionsContainer = this.parentPlex.children.filter((child) => child instanceof CICSRegionsContainer)?.[0];
      const parentRegion = regionsContainer
        .getChildren()!
        .filter((child) => child instanceof CICSRegionTree && child.getRegionName() === urimaps.eyu_cicsname)?.[0] as CICSRegionTree;
      const urimapsTree = new CICSURIMapTreeItem(urimaps, parentRegion, this);
      urimapsTree.setLabel(
        urimapsTree.label
          .toString()
          .replace(urimaps.name, `${urimaps.name} (${urimaps.eyu_cicsname}) [${urimapsTree.urimap.scheme}] (${urimapsTree.urimap.path})`)
      );
      newChildren.push(urimapsTree);
    }
    if (!count) {
      count = newChildren.length;
    }
    this.currentCount = newChildren.length;
    this.label = `All URI Maps ${this.activeFilter ? `(${this.activeFilter}) ` : " "}[${this.currentCount} of ${count}]`;
    if (count !== this.currentCount) {
      newChildren.push(new ViewMore(this, Math.min(this.incrementCount, count - this.currentCount)));
    }
    this.children = newChildren;
  }

  public async addMoreCachedResources(tree: CICSTree) {
    await window.withProgress(
      {
        title: "Loading more URI Maps",
        location: ProgressLocation.Notification,
        cancellable: false,
      },
      async () => {
        let criteria;
        if (this.activeFilter) {
          criteria = toEscapedCriteriaString(this.activeFilter, "NAME");
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
          const allURIMaps = await ProfileManagement.getCachedResources(
            this.parentPlex.getProfile(),
            cacheTokenInfo.cacheToken,
            this.constant,
            this.currentCount + 1,
            this.incrementCount
          );
          if (allURIMaps) {
            // @ts-ignore
            this.addURIMapsUtil(
              (this.getChildren()?.filter((child) => child instanceof CICSURIMapTreeItem) ?? []) as CICSURIMapTreeItem[],
              allURIMaps,
              count
            );
            tree._onDidChangeTreeData.fire(undefined);
          }
        }
      }
    );
  }

  public clearFilter() {
    this.activeFilter = undefined;
    this.label = `All URI Maps`;
    this.contextValue = `cicscombinedurimapstree.unfiltered`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public setFilter(newFilter: string) {
    this.activeFilter = newFilter;
    this.label = `All URI Maps (${this.activeFilter})`;
    this.contextValue = `cicscombinedurimapstree.filtered`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public getChildren() {
    return this.children ? this.children.filter((child) => !(child instanceof TextTreeItem)) : [];
  }

  public getActiveFilter() {
    return this.activeFilter;
  }

  public getParent() {
    return this.parentPlex;
  }
}
