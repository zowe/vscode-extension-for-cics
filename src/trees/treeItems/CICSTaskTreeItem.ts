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

export class CICSTaskTreeItem extends TreeItem {
  task: any;
  parentRegion: CICSRegionTree;

  constructor(
    task: any,
    parentRegion: CICSRegionTree,
    public readonly iconPath = getIconPathInResources("program-dark.svg", "program-light.svg")
  ) {

    super(`${task.task}`,
      TreeItemCollapsibleState.None
    );
    
    this.task = task;
    this.parentRegion = parentRegion;
    this.contextValue = `cicstask.`;
  }

  public setLabel(newLabel: string) {
    this.label = newLabel;
  }
}
