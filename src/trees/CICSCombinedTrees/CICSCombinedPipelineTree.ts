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
import { CICSPipelineTreeItem } from "../treeItems/web/treeItems/CICSPipelineTreeItem";

export class CICSCombinedPipelineTree extends TreeItem {
  children: (CICSPipelineTreeItem | ViewMore ) [] | [TextTreeItem] | null;
  parentPlex: CICSPlexTree;
  activeFilter: string | undefined;
  currentCount: number;
  incrementCount: number;
  constant: string;

  constructor(
    parentPlex: CICSPlexTree,
    public iconPath = getIconPathInResources("folder-closed-dark.svg", "folder-closed-light.svg")
  ) {
    super("All Pipelines", TreeItemCollapsibleState.Collapsed);
    this.contextValue = `cicscombinedpipelinetree.`;
    this.parentPlex = parentPlex;
    this.children = [new TextTreeItem("Use the search button to display pipelines", "applyfiltertext.")];
    this.activeFilter = undefined;
    this.currentCount = 0;
    this.incrementCount = +`${workspace.getConfiguration().get('zowe.cics.allPipelines.recordCountIncrement')}`; 
    this.constant = "CICSPipeline";
    }

    public async loadContents(tree: CICSTree){
      window.withProgress({
        title: 'Loading Pipelines',
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
              let allPipelines;
              if (recordsCount <= this.incrementCount) {
                allPipelines = await ProfileManagement.getCachedResources(this.parentPlex.getProfile(), cacheTokenInfo.cacheToken, this.constant, 1, parseInt(recordsCount, 10));
              } else {
                allPipelines = await ProfileManagement.getCachedResources(this.parentPlex.getProfile(), cacheTokenInfo.cacheToken, this.constant, 1, this.incrementCount);
                count = parseInt(recordsCount);
              }
              this.addPipelinesUtil([], allPipelines, count);
              this.iconPath = getIconPathInResources("folder-open-dark.svg", "folder-open-light.svg");
              tree._onDidChangeTreeData.fire(undefined);
            } else {
              this.children = [];
              this.iconPath = getIconPathInResources("folder-open-dark.svg", "folder-open-light.svg");
              tree._onDidChangeTreeData.fire(undefined);
              window.showInformationMessage(`No pipelines found`);
              this.label = `All Pipelines${this.activeFilter?` (${this.activeFilter}) `: " "}[${recordsCount}]`;
            }
          }
        } catch (error) {
          window.showErrorMessage(`Something went wrong when fetching pipelines - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(/(\\n\t|\\n|\\t)/gm," ")}`);
        }
        }
      );
    }

    public addPipelinesUtil(newChildren:(CICSPipelineTreeItem | ViewMore) [], allPipelines:any, count:number|undefined){
      for (const pipeline of allPipelines) {
        // Regions container must exist if all pipelines tree exists
        const regionsContainer = this.parentPlex.children.filter(child => {
          if (child instanceof CICSRegionsContainer) {
            return child;
          }
        })[0];
        const parentRegion = regionsContainer.getChildren()!.filter(child => {
          if (child instanceof CICSRegionTree) {
            return child.getRegionName() === pipeline.eyu_cicsname;
          }
        })[0] as CICSRegionTree;
        const pipelineTree = new CICSPipelineTreeItem(pipeline,parentRegion, this);
        pipelineTree.setLabel(pipelineTree.label!.toString().replace(pipeline.name, `${pipeline.name} (${pipeline.eyu_cicsname})`));
        newChildren.push(pipelineTree);
      }
      if (!count) {
        count = newChildren.length;
      }
      this.currentCount = newChildren.length;
      this.label = `All Pipelines ${this.activeFilter?`(${this.activeFilter}) `: " "}[${this.currentCount} of ${count}]`;
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
            const allPipelines = await ProfileManagement.getCachedResources(
              this.parentPlex.getProfile(),
              cacheTokenInfo.cacheToken,
              this.constant,
              this.currentCount+1,
              this.incrementCount
              );
            if (allPipelines) {
              // @ts-ignore
              this.addPipelinesUtil(this.getChildren() ? this.getChildren().filter((child) => child instanceof CICSPipelineTreeItem):[], 
                allPipelines,
                count
                );
              tree._onDidChangeTreeData.fire(undefined);
            }
          }
        });
    }

    public clearFilter() {
      this.activeFilter = undefined;
      this.label = `All Pipelines`;
      this.contextValue = `cicscombinedpipelinetree.unfiltered`;
      this.collapsibleState = TreeItemCollapsibleState.Expanded;
    }
  
    public setFilter(newFilter: string) {
      this.activeFilter = newFilter;
      this.label = `All Pipelines (${this.activeFilter})`;
      this.contextValue = `cicscombinedpipelinetree.filtered`;
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