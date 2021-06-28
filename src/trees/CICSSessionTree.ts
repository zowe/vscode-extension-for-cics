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

export class CICSSessionTreeItem extends TreeItem {
  sessionName: string;
  children: CICSRegionTreeItem[];
  session: any;
  cicsPlex: string;

  constructor(
    sessionName: string,
    session: any,
    cicsPlex: string,
    public readonly iconPath = {
      light: join(
        __filename,
        "..",
        "..",
        "..",
        "resources",
        "imgs",
        "list-dark.svg"
      ),
      dark: join(
        __filename,
        "..",
        "..",
        "..",
        "resources",
        "imgs",
        "list-light.svg"
      ),
    }
  ) {
    super(sessionName, TreeItemCollapsibleState.Collapsed);
    this.sessionName = sessionName;
    this.session = session;
    this.cicsPlex = cicsPlex;
    this.children = [];
    this.contextValue = `cicssession.${sessionName}`;
  }

  public addRegionChild(region: CICSRegionTreeItem) {
    this.children.push(region);
  }
}
