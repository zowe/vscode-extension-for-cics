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
import { CICSRegionTreeItem } from "./CICSRegionTree";
import { join } from "path";

export class CICSProgramTreeItem extends TreeItem {
  program: any;
  parentRegion: CICSRegionTreeItem;

  constructor(
    program: any,
    parentRegion: CICSRegionTreeItem,
    public readonly iconPath = {
      light: join(__filename, "..", "..", "..", "resources", "imgs", "program-dark.svg"),
      dark: join(__filename, "..", "..", "..", "resources", "imgs", "program-light.svg"),
    }
  ) {

    super(
      `${program.program}${program.status.toLowerCase() === "disabled" ? " (Disabled)" : ""
      }`,
      TreeItemCollapsibleState.None
    );
    console.log(iconPath.light);
    this.program = program;
    this.parentRegion = parentRegion;
    this.contextValue = `cicsprogram.${program.status.toLowerCase()}.${program.program
      }`;
  }
}
