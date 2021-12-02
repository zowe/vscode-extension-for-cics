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
import { CICSLocalFileTreeItem } from "./treeItems/CICSLocalFileTreeItem";

export class CICSCombinedLocalFileTree extends TreeItem {
  children: (CICSLocalFileTreeItem | ViewMore) [] | null;
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
    super("All Local Files", TreeItemCollapsibleState.Collapsed);
    this.contextValue = `cicscombinedlocalfiletree.`;
    this.parentPlex = parentPlex;
    this.children = [];
    this.activeFilter = undefined;
    this.currentCount = 0;
    this.incrementCount = 2;
    this.constant = "CICSLocalFile";
    }

    public async loadContents(tree : CICSTree){
      window.withProgress({
        title: 'Loading Local Files',
        location: ProgressLocation.Notification,
        cancellable: true
      }, async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the load");
        });
        let count;
        const cacheTokenInfo = await ProfileManagement.generateCacheToken(this.parentPlex.getProfile(),this.parentPlex.getPlexName(),this.constant);
        if (cacheTokenInfo) {
          const recordsCount = cacheTokenInfo.recordCount;
          let allLocalFiles;
          // need to change number
          if (recordsCount <= 3000) {
            allLocalFiles = await ProfileManagement.getAllResourcesInPlex(this.parentPlex, this.constant);
          } else {
            allLocalFiles = await ProfileManagement.getCachedResources(this.parentPlex.getProfile(), cacheTokenInfo.cacheToken, this.constant, 1, this.incrementCount);
            count = parseInt(recordsCount);
          }
          if (allLocalFiles) {
            this.addLocalFilesUtil([], allLocalFiles, count);
            tree._onDidChangeTreeData.fire(undefined);
          } else {
            window.showErrorMessage('Something went wrong when fetching all local local files');
          }
        }
        }
      );
    }

    public addLocalFilesUtil(newChildren:(CICSLocalFileTreeItem | ViewMore) [], allLocalFiles:any, count:number|undefined){
      for (const localfile of allLocalFiles) {
        const parentRegion = this.parentPlex.children.filter(child => {
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
      this.label = `All Local Files [${this.currentCount} of ${count}]`;
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
        const cacheTokenInfo = await ProfileManagement.generateCacheToken(this.parentPlex.getProfile(),this.parentPlex.getPlexName(),this.constant);
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
              this.addLocalFilesUtil(this.children ? this.children?.filter((child)=> child instanceof CICSLocalFileTreeItem):[], allLocalFiles, count);
              tree._onDidChangeTreeData.fire(undefined);
            }
          }
        });
    }

    public clearFilter() {
      this.activeFilter = undefined;
      // this.contextValue = `cicstreeprogram.${this.activeFilter ? 'filtered' : 'unfiltered'}.programs`;
      this.label = `All Local Files`;
      this.collapsibleState = TreeItemCollapsibleState.Expanded;
    }
  
    public setFilter(newFilter: string) {
      this.activeFilter = newFilter;
      // this.contextValue = `cicstreeprogram.${this.activeFilter ? 'filtered' : 'unfiltered'}.programs`;
      this.label = `All Local Files (${this.activeFilter})`;
      this.collapsibleState = TreeItemCollapsibleState.Expanded;
    }
}