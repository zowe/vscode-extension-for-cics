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
import { CICSLocalFileTreeItem } from "./treeItems/CICSLocalFileTreeItem";
import { getResource } from "@zowe/cics-for-zowe-cli";
import { CICSRegionTree } from "./CICSRegionTree";
import * as https from "https";
import { toEscapedCriteriaString } from "../utils/toEscapedCriteriaString";
import { getIconPathInResources } from "../utils/getIconPath";

export class CICSLocalFileTree extends TreeItem {
  children: CICSLocalFileTreeItem[] = [];
  parentRegion: CICSRegionTree;
  activeFilter: string | undefined = undefined;

  constructor(
    parentRegion: CICSRegionTree,
    public iconPath = getIconPathInResources("folder-closed-dark.svg", "folder-closed-light.svg")
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
    let criteria;
    if (this.activeFilter) {
      criteria = toEscapedCriteriaString(this.activeFilter, 'file');
    } else {
      criteria = defaultCriteria;
    }
    this.children = [];
    try {

      https.globalAgent.options.rejectUnauthorized = this.parentRegion.parentSession.session.ISession.rejectUnauthorized;
      
      const localFileResponse = await getResource(this.parentRegion.parentSession.session, {
        name: "CICSLocalFile",
        regionName: this.parentRegion.getRegionName(),
        cicsPlex: this.parentRegion.parentPlex ? this.parentRegion.parentPlex!.getPlexName() : undefined,
        criteria: criteria
      });
      https.globalAgent.options.rejectUnauthorized = undefined;
      const localFileArray = Array.isArray(localFileResponse.response.records.cicslocalfile) ? localFileResponse.response.records.cicslocalfile : [localFileResponse.response.records.cicslocalfile];
      this.label = `Local Files${this.activeFilter?` (${this.activeFilter}) `: " "}[${localFileArray.length}]`;
      for (const localFile of localFileArray) {
        const newLocalFileItem = new CICSLocalFileTreeItem(localFile, this.parentRegion);
        //@ts-ignore
        this.addLocalFile(newLocalFileItem);
      }
      this.iconPath = getIconPathInResources("folder-open-dark.svg", "folder-open-light.svg");
    } catch (error) {
      https.globalAgent.options.rejectUnauthorized = undefined;
      // @ts-ignore
      if (error!.mMessage!.includes('exceeded a resource limit')) {
        window.showErrorMessage(`Resource Limit Exceeded - Set a local file filter to narrow search`);
        // @ts-ignore
      } else if (error!.mMessage!.split(" ").join("").includes('recordcount:0')) {
        window.showInformationMessage(`No local files found`);
      } else {
        window.showErrorMessage(`Something went wrong when fetching local files - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(/(\\n\t|\\n|\\t)/gm," ")}`);
      }
    }
  }

  public clearFilter() {
    this.activeFilter = undefined;
    this.contextValue = `cicstreelocalfile.${this.activeFilter ? 'filtered' : 'unfiltered'}.localFiles`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public setFilter(newFilter: string) {
    this.activeFilter = newFilter;
    this.contextValue = `cicstreelocalfile.${this.activeFilter ? 'filtered' : 'unfiltered'}.localFiles`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public getFilter() {
    return this.activeFilter;
  }

}
