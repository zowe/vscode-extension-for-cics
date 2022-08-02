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
import { CICSDb2Tree } from "../CICSDb2Tree";
import { getIconPathInResources } from "../../utils/profileUtils";
export class CICSDb2TransactionTreeItem extends TreeItem {
  db2transaction: any;
  parentRegion: CICSDb2Tree;
  directParent: any;
  db2transactionName: string;

  constructor(
    db2transaction: any,
    parentRegion: CICSDb2Tree,
    directParent: any,
    public readonly iconPath = getIconPathInResources("local-transaction-dark.svg", "local-transaction-light.svg")
  ) {

    super(
      `${db2transaction.name}`,
      TreeItemCollapsibleState.None
    );
    this.db2transaction = db2transaction;
    this.contextValue = `cicsdb2transaction.${db2transaction.name}`;
    this.parentRegion = parentRegion;
    this.directParent = directParent;
    this.db2transactionName = db2transaction.name;
  }

  public setLabel(newLabel: string) {
    this.label = newLabel;
  }

  public getParent() {
    return this.directParent;
  }
}
