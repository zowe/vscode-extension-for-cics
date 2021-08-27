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

export class CICSFileDefinitionTreeItem extends TreeItem {
  fileDefinition: any;
  parentRegion: CICSRegionTree;

  constructor(
    fileDefinition: any,
    parentRegion: CICSRegionTree,
    public readonly iconPath = {
      light: join(__filename, "..", "..", "..", "..", "resources", "imgs", "program-dark.svg"),
      dark: join(__filename, "..", "..", "..", "..", "resources", "imgs", "program-light.svg"),
    }
  ) {

    super(
      `${fileDefinition.name}${fileDefinition.status.toLowerCase() === "disabled" ? " (Disabled)" : ""
      }`,
      TreeItemCollapsibleState.None
    );
    this.fileDefinition = fileDefinition;
    this.parentRegion = parentRegion;
    this.contextValue = `cicsdefinitionfile.${fileDefinition.status.toLowerCase()}.${fileDefinition.name
      }`;
  }
}
