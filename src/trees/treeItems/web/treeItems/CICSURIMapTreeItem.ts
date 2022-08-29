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
import { CICSRegionTree } from "../../../CICSRegionTree";
import { getIconPathInResources } from "../../../../utils/profileUtils";

export class CICSURIMapTreeItem extends TreeItem {
    urimap: any;
    parentRegion: CICSRegionTree;
    directParent: any;
  
    constructor(
      urimap: any,
      parentRegion: CICSRegionTree,
      directParent: any,
      public readonly iconPath = getIconPathInResources("program-dark.svg", "program-light.svg")
    ) {
  
      super(
        `${urimap.name}`,
        TreeItemCollapsibleState.None
      );
      
      this.urimap = urimap;
      this.parentRegion = parentRegion;
      this.directParent = directParent;
      this.contextValue = `cicsurimap.${urimap.name}`;
    }
  
    public setLabel(newLabel: string) {
      this.label = newLabel;
    }
  
    public getParent() {
      return this.directParent;
    }
}