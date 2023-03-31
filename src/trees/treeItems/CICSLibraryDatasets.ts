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

import { TreeItemCollapsibleState, TreeItem, window } from "vscode";
import { CICSRegionTree } from "../CICSRegionTree";
import { getIconPathInResources } from "../../utils/profileUtils";
import { CICSLibraryTreeItem } from "./CICSLibraryTreeItem";
import { getResource } from "@zowe/cics-for-zowe-cli";
import * as https from "https";
import { CICSLibraryTree } from "../CICSLibraryTree";
import { CICSProgramTreeItem } from "./CICSProgramTreeItem";
import { toEscapedCriteriaString } from "../../utils/filterUtils";

export class CICSLibraryDatasets extends TreeItem {
  children: CICSProgramTreeItem[] =[];
  dataset: any;
  parentRegion: CICSRegionTree;
  directParent: any;
  activeFilter: string | undefined = undefined;

  constructor(
    dataset: any,
    parentRegion: CICSRegionTree,
    directParent: any,
    public iconPath = getIconPathInResources("library-dark.svg", "library-light.svg")
  ) {

    super(
      `${dataset.dsname}`,
      TreeItemCollapsibleState.Collapsed
    );
    
    this.dataset = dataset;
    this.parentRegion = parentRegion;
    this.directParent = directParent;
    this.contextValue = `cicsdatasets.${this.activeFilter ? 'filtered' : 'unfiltered'}${dataset.dsname}`;
  }

  public setLabel(newlabel: string) {
    this.label = newlabel;
  }

  public addProgram(program: CICSProgramTreeItem) {
    this.children.push(program);
  }

  public async loadContents() {
    let defaultCriteria = "(librarydsn=" + "'" + this.dataset.dsname + "'" + ")";
    let criteria;

    if (this.activeFilter) {
      criteria = defaultCriteria + " AND " + toEscapedCriteriaString(this.activeFilter, 'PROGRAM');
    } else {
      criteria = defaultCriteria;
    }

    this.children = [];
    try {

      https.globalAgent.options.rejectUnauthorized = this.parentRegion.parentSession.session.ISession.rejectUnauthorized;
      const datasetResponse = await getResource(this.parentRegion.parentSession.session, {
        name: "CICSProgram",
        regionName: this.parentRegion.getRegionName(),
        cicsPlex: this.parentRegion.parentPlex ? this.parentRegion.parentPlex!.getPlexName() : undefined,
        criteria: criteria
      }); 
      https.globalAgent.options.rejectUnauthorized = undefined;

      const programsArray = Array.isArray(datasetResponse.response.records.cicsprogram) ? datasetResponse.response.records.cicsprogram: [datasetResponse.response.records.cicsprogram];
      this.label = `${this.dataset.dsname}${this.activeFilter?` (${this.activeFilter}) `: " "}[${programsArray.length}]`;
      for (const program of programsArray) {
        const newProgramItem = new CICSProgramTreeItem(program, this.parentRegion, this); 
        this.addProgram(newProgramItem);
      }

    } catch (error) {
      https.globalAgent.options.rejectUnauthorized = undefined;
      if ((error as any)!.mMessage!.includes('exceeded a resource limit')) {
        window.showErrorMessage(`Resource Limit Exceeded - Set a program filter to narrow search`);
      } else if (this.children.length === 0) {
        window.showInformationMessage(`No programs found`);
        this.label = `${this.dataset.dsname}${this.activeFilter?` (${this.activeFilter}) `: " "}[0]`;
      } else {
        window.showErrorMessage(`Something went wrong when fetching programs - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(/(\\n\t|\\n|\\t)/gm," ")}`);
      }
    }
  }

  public clearFilter() {
    this.activeFilter = undefined;
    this.contextValue = `cicsdatasets.${this.activeFilter ? 'filtered' : 'unfiltered'}${this.dataset.dsname}`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public setFilter(newFilter: string) {
    this.activeFilter = newFilter;
    this.contextValue = `cicsdatasets.${this.activeFilter ? 'filtered' : 'unfiltered'}${this.dataset.dsname}`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public getFilter() {
    return this.activeFilter;
  }

  public getParent() {
    return this.directParent;
  }
}
