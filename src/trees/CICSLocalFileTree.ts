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

import { TreeItemCollapsibleState, TreeItem, window, workspace } from "vscode";
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
        "bars-dark.svg"
      ),
      dark: join(
        __filename,
        "..",
        "..",
        "..",
        "resources",
        "imgs",
        "bars-light.svg"
      ),
    }
  ) {
    super('Local Files', TreeItemCollapsibleState.Collapsed);
    this.contextValue = `cicstreelocalfile.${this.activeFilter ? 'filtered' : 'unfiltered'}.localFiles`;
    this.parentRegion = parentRegion;
  }

  public addLocalFile(localFile: CICSLocalFileTreeItem) {
    this.children.push(localFile);
  }

  public async loadContents() {
    let defaultCriteria = `${await workspace.getConfiguration().get('Zowe.CICS.LocalFile.Filter')}`;
    if (!defaultCriteria || defaultCriteria.length === 0) {
      await workspace.getConfiguration().update('Zowe.CICS.LocalFile.Filter', 'file=*');
      defaultCriteria = 'file=*';
    }
    const criteria = this.activeFilter ? `file=${this.activeFilter}` : defaultCriteria;

    this.children = [];
    try {
      const localFileResponse = await getResource(this.parentRegion.parentSession.session, {
        name: "CICSLocalFile",
        regionName: this.parentRegion.getRegionName(),
        cicsPlex: this.parentRegion.parentPlex ? this.parentRegion.parentPlex!.getPlexName() : undefined,
        criteria: criteria
      });
      for (const localFile of Array.isArray(localFileResponse.response.records.cicslocalfile) ? localFileResponse.response.records.cicslocalfile : [localFileResponse.response.records.cicslocalfile]) {
        const newLocalFileItem = new CICSLocalFileTreeItem(localFile, this.parentRegion);
        //@ts-ignore
        this.addLocalFile(newLocalFileItem);
      }
    } catch (error) {
      // @ts-ignore
      if (error!.mMessage!.includes('exceeded a resource limit')) {
        window.showErrorMessage(`Resource Limit Exceeded - Set a local file filter to narrow search`);
        // @ts-ignore
      } else if (error!.mMessage!.replaceAll(' ', '').includes('recordcount:0')) {
        window.showInformationMessage(`No local files found`);
      } else {
        window.showErrorMessage(`Something went wrong when fetching local files`);
      }
    }
  }

  public clearFilter() {
    this.activeFilter = undefined;
    this.contextValue = `cicstreelocalfile.${this.activeFilter ? 'filtered' : 'unfiltered'}.localFiles`;
    this.label = `Local Files`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public setFilter(newFilter: string) {
    this.activeFilter = newFilter;
    this.contextValue = `cicstreelocalfile.${this.activeFilter ? 'filtered' : 'unfiltered'}.localFiles`;
    this.label = `Local Files (${this.activeFilter})`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

}
