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
import { CICSRegionTree } from "../CICSRegionTree";
import { CICSTree } from "../CICSTree";
import { ProfileManagement } from "../../utils/profileManagement";
import { ViewMore } from "../treeItems/utils/ViewMore";
import { CicsCmciConstants } from "@zowe/cics-for-zowe-cli";
import { toEscapedCriteriaString } from "../../utils/filterUtils";
import { CICSRegionsContainer } from "../CICSRegionsContainer";
import { TextTreeItem } from "../treeItems/utils/TextTreeItem";
import { getIconPathInResources } from "../../utils/profileUtils";
import { CICSWebServiceTreeItem } from "../treeItems/web/treeItems/CICSWebServiceTreeItem";

export class CICSCombinedWebServiceTree extends TreeItem {
  children: (CICSWebServiceTreeItem | ViewMore ) [] | [TextTreeItem] | null;
  parentPlex: CICSPlexTree;
  activeFilter: string | undefined;
  currentCount: number;
  incrementCount: number;
  constant: string;

  constructor(
    parentPlex: CICSPlexTree,
    public iconPath = getIconPathInResources("folder-closed-dark.svg", "folder-closed-light.svg")
  ) {
    super("All Web Services", TreeItemCollapsibleState.Collapsed);
    this.contextValue = `cicscombinedwebservicetree.`;
    this.parentPlex = parentPlex;
    this.children = [new TextTreeItem("Use the search button to display web services", "applyfiltertext.")];
    this.activeFilter = undefined;
    this.currentCount = 0;
    this.incrementCount = +`${workspace.getConfiguration().get('zowe.cics.allWebServices.recordCountIncrement')}`; 
    this.constant = "CICSWebService";
    }

    public async loadContents(tree: CICSTree){
      window.withProgress({
        title: 'Loading Web Services',
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
              let allWebServices;
              if (recordsCount <= this.incrementCount) {
                allWebServices = await ProfileManagement.getCachedResources(this.parentPlex.getProfile(), cacheTokenInfo.cacheToken, this.constant, 1, parseInt(recordsCount, 10));
              } else {
                allWebServices = await ProfileManagement.getCachedResources(this.parentPlex.getProfile(), cacheTokenInfo.cacheToken, this.constant, 1, this.incrementCount);
                count = parseInt(recordsCount);
              }
              this.addWebServicesUtil([], allWebServices, count);
              this.iconPath = getIconPathInResources("folder-open-dark.svg", "folder-open-light.svg");
              tree._onDidChangeTreeData.fire(undefined);
            } else {
              this.children = [];
              this.iconPath = getIconPathInResources("folder-open-dark.svg", "folder-open-light.svg");
              tree._onDidChangeTreeData.fire(undefined);
              window.showInformationMessage(`No Web Services found`);
              this.label = `All Web Services${this.activeFilter?` (${this.activeFilter}) `: " "}[${recordsCount}]`;
            }
          }
        } catch (error) {
          window.showErrorMessage(`Something went wrong when fetching web services - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(/(\\n\t|\\n|\\t)/gm," ")}`);
        }
        }
      );
    }

    public addWebServicesUtil(newChildren:(CICSWebServiceTreeItem | ViewMore) [], allWebServices:any, count:number|undefined){
      for (const webservice of allWebServices) {
        // Regions container must exist if all web services tree exists
        const regionsContainer = this.parentPlex.children.filter(child => {
          if (child instanceof CICSRegionsContainer) {
            return child;
          }
        })[0];
        const parentRegion = regionsContainer.getChildren()!.filter(child => {
          if (child instanceof CICSRegionTree) {
            return child.getRegionName() === webservice.eyu_cicsname;
          }
        })[0] as CICSRegionTree;
        const webserviceTree = new CICSWebServiceTreeItem(webservice,parentRegion, this);
        webserviceTree.setLabel(webserviceTree.label!.toString().replace(webservice.name, `${webservice.name} (${webservice.eyu_cicsname})`));
        newChildren.push(webserviceTree);
      }
      if (!count) {
        count = newChildren.length;
      }
      this.currentCount = newChildren.length;
      this.label = `All Web Services ${this.activeFilter?`(${this.activeFilter}) `: " "}[${this.currentCount} of ${count}]`;
      if (count !== this.currentCount) {
        newChildren.push(new ViewMore(this, Math.min(this.incrementCount, count-this.currentCount)));
      }
      this.children = newChildren;
    }

    public async addMoreCachedResources(tree: CICSTree) {
      window.withProgress({
        title: 'Loading more pipelins',
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
            const allWebServices = await ProfileManagement.getCachedResources(
              this.parentPlex.getProfile(),
              cacheTokenInfo.cacheToken,
              this.constant,
              this.currentCount+1,
              this.incrementCount
              );
            if (allWebServices) {
              // @ts-ignore
              this.addWebServicesUtil(this.getChildren() ? this.getChildren().filter((child) => child instanceof CICSWebServiceTreeItem):[], 
                allWebServices,
                count
                );
              tree._onDidChangeTreeData.fire(undefined);
            }
          }
        });
    }

    public clearFilter() {
      this.activeFilter = undefined;
      this.label = `All Web Services`;
      this.contextValue = `cicscombinedwebservicetree.unfiltered`;
      this.collapsibleState = TreeItemCollapsibleState.Expanded;
    }
  
    public setFilter(newFilter: string) {
      this.activeFilter = newFilter;
      this.label = `All Web Services (${this.activeFilter})`;
      this.contextValue = `cicscombinedwebservicetree.filtered`;
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