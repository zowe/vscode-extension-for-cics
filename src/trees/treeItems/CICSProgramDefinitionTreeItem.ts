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
import { join } from "path";

export class CICSProgramDefinitionTreeItem extends TreeItem {
  programDefinition: any;
  parentRegion: CICSRegionTree;

  constructor(
    programDefinition: any,
    parentRegion: CICSRegionTree,
    public readonly iconPath = {
      light: join(__filename, "..", "..", "..", "..", "resources", "imgs", "program-dark.svg"),
      dark: join(__filename, "..", "..", "..", "..", "resources", "imgs", "program-light.svg"),
    }
  ) {

    super(
      `${programDefinition.name}${programDefinition.status.toLowerCase() === "disabled" ? " (Disabled)" : ""
      }`,
      TreeItemCollapsibleState.None
    );
    this.programDefinition = programDefinition;
    this.parentRegion = parentRegion;
    this.contextValue = `cicsdefinitionprogram.${programDefinition.status.toLowerCase()}.${programDefinition.name
      }`;
  }
}
