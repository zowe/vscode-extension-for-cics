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
import { getResource } from "@zowe/cics-for-zowe-cli";
import * as https from "https";
import { getIconPathInResources } from "../../utils/profileUtils";
import { CICSLibraryDatasets } from "./CICSLibraryDatasets";

export class CICSLibraryTreeItem extends TreeItem {
  children: CICSLibraryDatasets[] = [];
  library: any;
  parentRegion: CICSRegionTree;
  directParent: any;

  constructor(
    library: any,
    parentRegion: CICSRegionTree,
    directParent: any,
    public iconPath = getIconPathInResources("folder-closed-dark.svg", "folder-closed-light.svg")
  ) {

    super(
      `${library.name}`,
      TreeItemCollapsibleState.Collapsed
    );

    this.library = library;
    this.parentRegion = parentRegion;
    this.directParent = directParent;
    this.contextValue = `cicslibrary.${library.name}`;
  }

  public setLabel(newLabel: string) {
    this.label = newLabel;
  }

  public addDataset(dataset: CICSLibraryDatasets) {
    this.children.push(dataset);
  }

  public async loadContents() {
    let defaultCriteria = '(library=' + this.library.name + ')';
    let criteria;
    
    criteria = defaultCriteria;
    this.children = [];
    try {

      https.globalAgent.options.rejectUnauthorized = this.parentRegion.parentSession.session.ISession.rejectUnauthorized;

      const libraryResponse = await getResource(this.parentRegion.parentSession.session, {
        name: "cicslibrarydatasetname",
        regionName: this.parentRegion.getRegionName(),
        cicsPlex: this.parentRegion.parentPlex ? this.parentRegion.parentPlex!.getPlexName() : undefined,
        criteria: criteria
      }); 
      https.globalAgent.options.rejectUnauthorized = undefined;
      const datasetArray = Array.isArray(libraryResponse.response.records.cicslibrarydatasetname) ? libraryResponse.response.records.cicslibrarydatasetname : [libraryResponse.response.records.cicslibrarydatasetname];
      this.label = `${this.library.name} [${datasetArray.length}]${this.parentRegion.parentPlex ? ` (${this.library.eyu_cicsname})` : ""}`;
      for (const dataset of datasetArray) {
        const newDatasetItem = new CICSLibraryDatasets(dataset, this.parentRegion, this); //this=CICSLibraryTreeItem
        this.addDataset(newDatasetItem);
      }
      this.iconPath = getIconPathInResources("folder-open-dark.svg", "folder-open-light.svg");
    } catch (error) {
      https.globalAgent.options.rejectUnauthorized = undefined;
      if ((error as any)!.mMessage!.includes('exceeded a resource limit')) {
        window.showErrorMessage(`Resource Limit Exceeded - Set a datasets filter to narrow search`);
      } else if ((error as any).mMessage!.split(" ").join("").includes('recordcount:0')) {
        window.showInformationMessage(`No datasets found`);
      } else {
        window.showErrorMessage(`Something went wrong when fetching datasets - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(/(\\n\t|\\n|\\t)/gm," ")}`);
      }
    }
  }

  public getParent() {
    return this.directParent;
  }
}
