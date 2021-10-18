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
import { CICSProgramTreeItem } from "./treeItems/CICSProgramTreeItem";
import { CICSRegionTree } from "./CICSRegionTree";
import { getResource } from "@zowe/cics-for-zowe-cli";
import * as https from "https";
export class CICSProgramTree extends TreeItem {
  children: CICSProgramTreeItem[] = [];
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
    super('Programs', TreeItemCollapsibleState.Collapsed);
    this.contextValue = `cicstreeprogram.${this.activeFilter ? 'filtered' : 'unfiltered'}.programs`;
    this.parentRegion = parentRegion;
  }

  public addProgram(program: CICSProgramTreeItem) {
    this.children.push(program);
  }

  public async loadContents() {
    let defaultCriteria = `${await workspace.getConfiguration().get('Zowe.CICS.Program.Filter')}`;
    if (!defaultCriteria || defaultCriteria.length === 0) {
      await workspace.getConfiguration().update('Zowe.CICS.Program.Filter', 'NOT (PROGRAM=CEE* OR PROGRAM=DFH* OR PROGRAM=CJ* OR PROGRAM=EYU* OR PROGRAM=CSQ* OR PROGRAM=CEL* OR PROGRAM=IGZ*)');
      defaultCriteria = 'NOT (PROGRAM=CEE* OR PROGRAM=DFH* OR PROGRAM=CJ* OR PROGRAM=EYU* OR PROGRAM=CSQ* OR PROGRAM=CEL* OR PROGRAM=IGZ*)';
    }
    let criteria;
    if (this.activeFilter) {
      const splitActiveFilter = this.activeFilter.split(",");
      criteria = "(";
      for(const index in splitActiveFilter!){
        criteria += `PROGRAM=${splitActiveFilter[parseInt(index)]}`;
        if (parseInt(index) !== splitActiveFilter.length-1){
          criteria += " OR ";
        }
      }
      criteria += ")";
    } else {
      criteria = defaultCriteria;
    }
    this.children = [];
    try {
      if (this.parentRegion.parentSession.session.ISession.rejectUnauthorized === false) {
        https.globalAgent.options.rejectUnauthorized = false;
      }
      const programResponse = await getResource(this.parentRegion.parentSession.session, {
        name: "CICSProgram",
        regionName: this.parentRegion.getRegionName(),
        cicsPlex: this.parentRegion.parentPlex ? this.parentRegion.parentPlex!.getPlexName() : undefined,
        criteria: criteria
      });
      https.globalAgent.options.rejectUnauthorized = true;
      for (const program of Array.isArray(programResponse.response.records.cicsprogram) ? programResponse.response.records.cicsprogram : [programResponse.response.records.cicsprogram]) {
        const newProgramItem = new CICSProgramTreeItem(program, this.parentRegion);
        //@ts-ignore
        this.addProgram(newProgramItem);
      }
    } catch (error) {
      https.globalAgent.options.rejectUnauthorized = true;
      // @ts-ignore
      if (error!.mMessage!.includes('exceeded a resource limit')) {
        window.showErrorMessage(`Resource Limit Exceeded - Set a program filter to narrow search`);
        // @ts-ignore
      } else if (error!.mMessage!.split(" ").join("").includes('recordcount:0')) {
        window.showInformationMessage(`No programs found`);
      } else {
        window.showErrorMessage(`Something went wrong when fetching programs`);
      }
    }
  }

  public clearFilter() {
    this.activeFilter = undefined;
    this.contextValue = `cicstreeprogram.${this.activeFilter ? 'filtered' : 'unfiltered'}.programs`;
    this.label = `Programs`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public setFilter(newFilter: string) {
    this.activeFilter = newFilter;
    this.contextValue = `cicstreeprogram.${this.activeFilter ? 'filtered' : 'unfiltered'}.programs`;
    this.label = `Programs (${this.activeFilter})`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }
}
