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
import { CICSRegionTree } from "../CICSRegionTree";
import { getIconPathInResources } from "../../utils/profileUtils";
import { CICSLibraryTreeItem } from "./CICSLibraryTreeItem";
import { CICSLibraryTree } from "../CICSLibraryTree";

export class CICSLibraryDatasets extends TreeItem {
  dataset: any;
  parentRegion: any;
  directParent: CICSLibraryTreeItem;

  constructor(
    dataset: any,
    parentRegion: any,
    directParent: CICSLibraryTreeItem,
    public readonly iconPath = getIconPathInResources("library-dark.svg", "library-light.svg")
  ) {

    super(
      `${dataset.dsname}`,
      TreeItemCollapsibleState.None
    );
    
    this.dataset = dataset;
    this.parentRegion = parentRegion;
    this.directParent = directParent;
    this.contextValue = `cicsdatasets.${dataset.dsname}`;
  }

  public setLabel(newlabel: string) {
    this.label = newlabel;
  }

  public getParent() {
    return this.directParent;
  }
}
