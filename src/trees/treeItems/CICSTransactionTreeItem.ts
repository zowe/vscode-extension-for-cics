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

export class CICSTransactionTreeItem extends TreeItem {
  transaction: any;
  parentRegion: CICSRegionTree;
  transactionName: string;

  constructor(
    transaction: any,
    parentRegion: CICSRegionTree,
    public readonly iconPath = {
      light: join(__filename, "..", "..", "..", "..", "resources", "imgs", "local-transaction-dark.svg"),
      dark: join(__filename, "..", "..", "..", "..", "resources", "imgs", "local-transaction-light.svg"),
    }
  ) {

    super(
      `${transaction.tranid}`,
      TreeItemCollapsibleState.None
    );
    this.transaction = transaction;
    this.contextValue = `cicstransaction.TRANSACTION`;
    this.parentRegion = parentRegion;
    this.transactionName = transaction.tranid;
  }
}
