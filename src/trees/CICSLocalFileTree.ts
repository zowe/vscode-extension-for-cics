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

import { TreeItemCollapsibleState, TreeItem } from "vscode";
import { join } from "path";
import { CICSLocalFileTreeItem } from "./treeItems/CICSLocalFileTreeItem";
import { getResource } from "@zowe/cics-for-zowe-cli";
import { CICSRegionTree } from "./CICSRegionTree";

export class CICSLocalFileTree extends TreeItem {
  children: CICSLocalFileTreeItem[] = [];
  parentRegion: CICSRegionTree;
  activeFilter: string | undefined = undefined;

  constructor(
    parentRegion: CICSRegionTree,
    public readonly iconPath = {
      light: join(
        __filename,
        "..",
        "..",
        "..",
        "resources",
        "imgs",
        "list-dark.svg"
      ),
      dark: join(
        __filename,
        "..",
        "..",
        "..",
        "resources",
        "imgs",
        "list-light.svg"
      ),
    }
  ) {
    super('Local Files', TreeItemCollapsibleState.Collapsed);
    this.contextValue = `cicslocalfiletree.${this.activeFilter ? 'filtered' : 'unfiltered'}.localFiles`;
    this.parentRegion = parentRegion;
  }

  public addLocalFile(localFile: CICSLocalFileTreeItem) {
    this.children.push(localFile);
  }

  public async loadContents() {
    try {
      const localFileResponse = await getResource(this.parentRegion.parentSession.session, {
        name: "CICSLocalFile",
        regionName: this.parentRegion.getRegionName(),
        cicsPlex: this.parentRegion.parentPlex ? this.parentRegion.parentPlex!.getPlexName() : undefined,
      });
      this.children = [];
      for (const localFile of localFileResponse.response.records.cicslocalfile) {
        if (!this.activeFilter) {
          const newLocalFileItem = new CICSLocalFileTreeItem(localFile, this.parentRegion);
          //@ts-ignore
          this.addLocalFile(newLocalFileItem);
        } else {
          const regex = new RegExp(this.activeFilter.toUpperCase());
          if (regex.test(localFile.file)) {
            const newLocalFileItem = new CICSLocalFileTreeItem(localFile, this.parentRegion);
            //@ts-ignore
            this.addLocalFile(newLocalFileItem);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  public clearFilter() {
    this.activeFilter = undefined;
    this.contextValue = `cicslocalfiletree.${this.activeFilter ? 'filtered' : 'unfiltered'}.localFiles`;
    this.label = `Local Files`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public setFilter(newFilter: string) {
    this.activeFilter = newFilter;
    this.contextValue = `cicslocalfiletree.${this.activeFilter ? 'filtered' : 'unfiltered'}.localFiles`;
    this.label = `Local Files (${this.activeFilter})`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

}
