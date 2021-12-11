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
import { getIconPathInResources } from "../../utils/getIconPath";

export class CICSProgramTreeItem extends TreeItem {
  program: any;
  parentRegion: CICSRegionTree;

  constructor(
    program: any,
    parentRegion: CICSRegionTree,
    public readonly iconPath = getIconPathInResources("program-dark.svg", "program-light.svg")
  ) {

    super(
      `${program.program}${(
        program.status.toLowerCase() === "disabled" && parseInt(program.newcopycnt) ? ` (New copy count: ${program.newcopycnt}) (Disabled)` : 
        program.status.toLowerCase() === "disabled" && !parseInt(program.newcopycnt) ? ` (Disabled)` : 
        program.status.toLowerCase() !== "disabled" && parseInt(program.newcopycnt) ? `  (New copy count: ${program.newcopycnt})` : 
        ""
      )}`,
      TreeItemCollapsibleState.None
    );
    
    this.program = program;
    this.parentRegion = parentRegion;
    this.contextValue = `cicsprogram.${program.status.toLowerCase()}.${program.program
      }`;
  }

  public setLabel(newLabel: string) {
    this.label = newLabel;
  }
}
