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
import { CICSProgramTreeItem } from "./treeItems/CICSProgramTreeItem";
import { CICSRegionTree } from "./CICSRegionTree";
import { getResource } from "@zowe/cics-for-zowe-cli";
import { CICSProgramDefinitionTreeItem } from "./treeItems/CICSProgramDefinitionTreeItem";

export class CICSProgramDefinitionTree extends TreeItem {
  children: CICSProgramDefinitionTreeItem[] = [];
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
    super('Programs', TreeItemCollapsibleState.Collapsed);
    this.contextValue = `cicstreedefinitionprogram.${this.activeFilter ? 'filtered' : 'unfiltered'}.programs`;
    this.parentRegion = parentRegion;
  }

  public addProgramDefinition(program: CICSProgramDefinitionTreeItem) {
    this.children.push(program);
  }

  public async loadContents() {
    try {
      const programResponse = await getResource(this.parentRegion.parentSession.session, {
        name: "CICSDefinitionProgram",
        regionName: this.parentRegion.getRegionName(),
        cicsPlex: this.parentRegion.parentPlex ? this.parentRegion.parentPlex!.getPlexName() : undefined,
        criteria: this.activeFilter ? `NAME=${this.activeFilter}` : undefined,
        parameter: "CSDGROUP(*)"
      });

      this.children = [];
      for (const programDefinition of Array.isArray(programResponse.response.records.cicsdefinitionprogram) ? programResponse.response.records.cicsdefinitionprogram : [programResponse.response.records.cicsdefinitionprogram]) {
        const newProgramDefinitionItem = new CICSProgramDefinitionTreeItem(programDefinition, this.parentRegion);
        //@ts-ignore
        this.addProgramDefinition(newProgramDefinitionItem);
      }
    } catch (error) {
      console.log(error);
    }
  }

  public clearFilter() {
    this.activeFilter = undefined;
    this.contextValue = `cicstreedefinitionprogram.${this.activeFilter ? 'filtered' : 'unfiltered'}.programs`;
    this.label = `Programs`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public setFilter(newFilter: string) {
    this.activeFilter = newFilter;
    this.contextValue = `cicstreedefinitionprogram.${this.activeFilter ? 'filtered' : 'unfiltered'}.programs`;
    this.label = `Programs (${this.activeFilter})`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }
}
