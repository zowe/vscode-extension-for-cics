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

export class ViewMore extends TreeItem {
  parent: any;

  constructor(
    parent: any,
    numberLeft: number
  ) {
    super(
      `View ${numberLeft} more ...`,
      TreeItemCollapsibleState.None
    );
    this.parent = parent;
    this.contextValue = 'viewmore.';
    this.command = {
      title: 'View more',
      command: 'cics-extension-for-zowe.viewMore'
    };
  }
}
