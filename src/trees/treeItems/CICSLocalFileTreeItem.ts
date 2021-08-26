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
import { join } from "path";
import { CICSRegionTree } from "../CICSRegionTree";

export class CICSLocalFileTreeItem extends TreeItem {
  localFile: any;
  parentRegion: CICSRegionTree;
  localFileName: string;

  constructor(
    localFile: any,
    parentRegion: CICSRegionTree,
    public readonly iconPath = {
      light: join(__filename, "..", "..", "..", "..", "resources", "imgs", "local-file-dark.svg"),
      dark: join(__filename, "..", "..", "..", "..", "resources", "imgs", "local-file-light.svg"),
    }
  ) {

    super(
      `${localFile.file}`,
      TreeItemCollapsibleState.None
    );
    this.localFile = localFile;
    this.contextValue = `cicslocalfile.${localFile.file}`;
    this.parentRegion = parentRegion;
    this.localFileName = localFile.file;
  }
}
