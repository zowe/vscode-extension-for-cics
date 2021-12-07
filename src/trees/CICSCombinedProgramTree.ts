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
import { ViewMore } from "./treeItems/utils/ViewMore";
import { getDefaultProgramFilter } from "../utils/getDefaultProgramFilter";
import { CicsCmciConstants } from "@zowe/cics-for-zowe-cli";
import { toEscapedCriteriaString } from "../utils/toEscapedCriteriaString";

export class CICSCombinedProgramTree extends TreeItem {
  children: (CICSProgramTreeItem | ViewMore) [] | null;
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
    this.constant = CicsCmciConstants.CICS_PROGRAM_RESOURCE;
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
        try {
          let defaultCriteria = await getDefaultProgramFilter();
          let criteria;
          if (this.activeFilter) {
            criteria = toEscapedCriteriaString(this.activeFilter, 'PROGRAM');
          } else {
            criteria = defaultCriteria;
          }
          let count;
          const cacheTokenInfo = await ProfileManagement.generateCacheToken(this.parentPlex.getProfile(),this.parentPlex.getPlexName(),this.constant,criteria);
          if (cacheTokenInfo) {
            const recordsCount = cacheTokenInfo.recordCount;
            if (parseInt(recordsCount, 10)) {
              let allPrograms;
              // need to change number
              if (recordsCount <= 3000) {
                allPrograms = await ProfileManagement.getAllResourcesInPlex(this.parentPlex, this.constant, criteria);
              } else {
                allPrograms = await ProfileManagement.getCachedResources(this.parentPlex.getProfile(), cacheTokenInfo.cacheToken, this.constant, 1, this.incrementCount);
                count = parseInt(recordsCount);
              }
              this.addProgramsUtil([], allPrograms, count);
              tree._onDidChangeTreeData.fire(undefined);
            } else {
              this.children = [];
              tree._onDidChangeTreeData.fire(undefined);
              window.showInformationMessage(`No programs found`);
            }
          }
        } catch (error) {
          window.showErrorMessage(`Something went wrong when fetching programs - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(/(\\n\t|\\n|\\t)/gm," ")}`);
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
      this.label = `All Programs ${this.activeFilter?`(${this.activeFilter}) `: " "}[${this.currentCount} of ${count}]`;
      if (count !== this.currentCount) {
        newChildren.push(new ViewMore(this, Math.min(this.incrementCount, count-this.currentCount)));
      }
      this.children = newChildren;
    }

    public async addMoreCachedResources(tree: CICSTree) {
      window.withProgress({
        title: 'Loading more programs',
        location: ProgressLocation.Notification,
        cancellable: false
      }, async () => {
        const defaultCriteria = await getDefaultProgramFilter();
        const cacheTokenInfo = await ProfileManagement.generateCacheToken(this.parentPlex.getProfile(),this.parentPlex.getPlexName(),this.constant,defaultCriteria);
          if (cacheTokenInfo) {
            // record count may have updated
            const recordsCount = cacheTokenInfo.recordCount;
            const count = parseInt(recordsCount);
            const allPrograms = await ProfileManagement.getCachedResources(
              this.parentPlex.getProfile(),
              cacheTokenInfo.cacheToken,
              this.constant,
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
      this.label = `All Programs`;
      this.contextValue = `cicscombinedprogramtree.unfiltered`;
      this.collapsibleState = TreeItemCollapsibleState.Expanded;
    }
  
    public setFilter(newFilter: string) {
      this.activeFilter = newFilter;
      this.label = `All Programs (${this.activeFilter})`;
      this.contextValue = `cicscombinedprogramtree.filtered`;
      this.collapsibleState = TreeItemCollapsibleState.Expanded;
    }
}