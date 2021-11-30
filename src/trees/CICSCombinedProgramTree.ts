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
import { join } from "path";
import { CICSPlexTree } from "./CICSPlexTree";
import { CICSProgramTreeItem } from "./treeItems/CICSProgramTreeItem";
import { CICSRegionTree } from "./CICSRegionTree";
import { CICSTree } from "./CICSTree";
import { ProfileManagement } from "../utils/profileManagement";
import { ViewMore } from "./treeItems/viewMore";
import { getDefaultProgramFilter } from "../utils/getDefaultProgramFilter";

export class CICSCombinedProgramTree extends TreeItem {
  children: (CICSProgramTreeItem | ViewMore) [] | null;
  parentPlex: CICSPlexTree;
  activeFilter: string | undefined;
  currentCount: number;
  incrementCount: number;

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
        "programs-dark.svg"
      ),
      dark: join(
        __filename,
        "..",
        "..",
        "..",
        "resources",
        "imgs",
        "programs-light.svg"
      ),
    }
  ) {
    super("All Programs", TreeItemCollapsibleState.Collapsed);
    this.contextValue = `cicscombinedprogramtree.`;
    this.parentPlex = parentPlex;
    this.children = [];
    this.activeFilter = undefined;
    this.currentCount = 0;
    this.incrementCount = 2;
    }

    public async loadContents(tree : CICSTree){
      window.withProgress({
        title: 'Loading Programs',
        location: ProgressLocation.Notification,
        cancellable: true
      }, async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the load");
        });
        let defaultCriteria = await getDefaultProgramFilter();
        const regionFilters = this.parentPlex.findResourceFilters();
        let criteria;
        let count;
        const cacheTokenInfo = await ProfileManagement.generateCacheToken(this.parentPlex.getProfile(),this.parentPlex.getPlexName(),defaultCriteria);
        if (cacheTokenInfo) {
          const recordsCount = cacheTokenInfo.recordCount;
          let allPrograms;
          // need to change number
          if (recordsCount <= 3000) {
            allPrograms = await ProfileManagement.getAllProgramsInPlex(this.parentPlex, defaultCriteria);
          } else {
            allPrograms = await ProfileManagement.getCachedPrograms(this.parentPlex.getProfile(), cacheTokenInfo.cacheToken, 1, this.incrementCount);
            count = parseInt(recordsCount);
          }
          if (allPrograms) {
            this.addProgramsUtil([], allPrograms, count);
            tree._onDidChangeTreeData.fire(undefined);
          } else {
            window.showErrorMessage('Something went wrong when fetching all programs');
          }
        }
        }
      );
    }

    public addProgramsUtil(newChildren:(CICSProgramTreeItem | ViewMore) [], allPrograms:any, count:number|undefined){
      for (const program of allPrograms) {
        const parentRegion = this.parentPlex.children.filter(child => {
          if (child instanceof CICSRegionTree) {
            return child.getRegionName() === program.eyu_cicsname;
          }
        })[0];
        //@ts-ignore
        const progamTree = new CICSProgramTreeItem(program,parentRegion);
        progamTree.setLabel(progamTree.label!.toString().replace(program.program, `${program.program} (${program.eyu_cicsname})`));
        newChildren.push(progamTree);
      }
      if (!count) {
        count = newChildren.length;
      }
      this.currentCount = newChildren.length;
      this.label = `All Programs [${this.currentCount} of ${count}]`;
      newChildren.push(new ViewMore(this, Math.min(this.incrementCount, count-this.currentCount)));
      this.children = newChildren;
    }

    public async addMoreCachedPrograms(tree: CICSTree) {
      window.withProgress({
        title: 'Loading more programs',
        location: ProgressLocation.Notification,
        cancellable: false
      }, async () => {
        const defaultCriteria = await getDefaultProgramFilter();
        const cacheTokenInfo = await ProfileManagement.generateCacheToken(this.parentPlex.getProfile(),this.parentPlex.getPlexName(),defaultCriteria);
          if (cacheTokenInfo) {
            // record count may have updated
            const recordsCount = cacheTokenInfo.recordCount;
            const count = parseInt(recordsCount);
            const allPrograms = await ProfileManagement.getCachedPrograms(
              this.parentPlex.getProfile(),cacheTokenInfo.cacheToken,
              this.currentCount+1,
              this.incrementCount
              );
            if (allPrograms) {
              this.addProgramsUtil(this.children ? this.children?.filter((child)=> child instanceof CICSProgramTreeItem):[], allPrograms, count);
              tree._onDidChangeTreeData.fire(undefined);
            }
          }
        });
    }

    public clearFilter() {
      this.activeFilter = undefined;
      // this.contextValue = `cicstreeprogram.${this.activeFilter ? 'filtered' : 'unfiltered'}.programs`;
      this.label = `All Programs`;
      this.collapsibleState = TreeItemCollapsibleState.Expanded;
    }
  
    public setFilter(newFilter: string) {
      this.activeFilter = newFilter;
      // this.contextValue = `cicstreeprogram.${this.activeFilter ? 'filtered' : 'unfiltered'}.programs`;
      this.label = `All Programs (${this.activeFilter})`;
      this.collapsibleState = TreeItemCollapsibleState.Expanded;
    }
}