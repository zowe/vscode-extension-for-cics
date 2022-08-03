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
import { CICSDb2Tree } from "../Db2/CICSDb2Tree";
import { getIconPathInResources } from "../../utils/profileUtils";
export class CICSDb2TransactionDefinitionTreeItem extends TreeItem {
  db2definition: any;
  parentRegion: CICSDb2Tree;
  directParent: any;
  db2definitionName: string;

  constructor(
    db2definition: any,
    parentRegion: CICSDb2Tree,
    directParent: any,
    public readonly iconPath = getIconPathInResources("local-transaction-dark.svg", "local-transaction-light.svg")
  ) {

    super(
      `${db2definition.name}`,
      TreeItemCollapsibleState.None
    );
    this.db2definition = db2definition;
    this.contextValue = `cicsdefinitiondb2transaction.${db2definition.name}`;
    this.parentRegion = parentRegion;
    this.directParent = directParent;
    this.db2definitionName = db2definition.name;
  }

  public setLabel(newLabel: string) {
    this.label = newLabel;
  }

  public getParent() {
    return this.directParent;
  }
}
