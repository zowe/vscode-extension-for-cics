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
import { CICSRegionTree } from "./CICSRegionTree";
import { getResource } from "@zowe/cics-for-zowe-cli";
import { CICSFileDefinitionTreeItem } from "./treeItems/CICSFileDefinitionTreeItem";

export class CICSFileDefinitionTree extends TreeItem {
  children: CICSFileDefinitionTreeItem[] = [];
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
    super('Files', TreeItemCollapsibleState.Collapsed);
    this.contextValue = `cicstreedefinitionfile.${this.activeFilter ? 'filtered' : 'unfiltered'}.files`;
    this.parentRegion = parentRegion;
  }

  public addFileDefinition(file: CICSFileDefinitionTreeItem) {
    this.children.push(file);
  }

  public async loadContents() {
    try {
      const fileResponse = await getResource(this.parentRegion.parentSession.session, {
        name: "CICSDefinitionFile",
        regionName: this.parentRegion.getRegionName(),
        cicsPlex: this.parentRegion.parentPlex ? this.parentRegion.parentPlex!.getPlexName() : undefined,
        criteria: this.activeFilter ? `NAME=${this.activeFilter}` : undefined,
        parameter: "CSDGROUP(*)"
      });

      this.children = [];
      for (const fileDefinition of Array.isArray(fileResponse.response.records.cicsdefinitionfile) ? fileResponse.response.records.cicsdefinitionfile : [fileResponse.response.records.cicsdefinitionfile]) {
        const newFileDefinitionItem = new CICSFileDefinitionTreeItem(fileDefinition, this.parentRegion);
        //@ts-ignore
        this.addFileDefinition(newFileDefinitionItem);
      }
    } catch (error) {
      console.log(error);
    }
  }

  public clearFilter() {
    this.activeFilter = undefined;
    this.contextValue = `cicstreedefinitionfile.${this.activeFilter ? 'filtered' : 'unfiltered'}.files`;
    this.label = `Files`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public setFilter(newFilter: string) {
    this.activeFilter = newFilter;
    this.contextValue = `cicstreedefinitionfile.${this.activeFilter ? 'filtered' : 'unfiltered'}.files`;
    this.label = `Programs (${this.activeFilter})`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }
}
