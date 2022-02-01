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

import { commands, window, WebviewPanel, TreeView } from "vscode";
import { CICSTransactionTreeItem } from "../trees/treeItems/CICSTransactionTreeItem";
import { findSelectedNodes } from "../utils/commandUtils";
import { getAttributesHtml } from "../utils/webviewHTML";

export function getShowTransactionAttributesCommand(treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.showTransactionAttributes",
    async (node) => {
      const allSelectedNodes = findSelectedNodes(treeview, CICSTransactionTreeItem, node);
      if (!allSelectedNodes || !allSelectedNodes.length) {
        window.showErrorMessage("No CICS transaction selected");
        return;
      }
      for (const localTransactionTreeItem of allSelectedNodes) {
        const transaction = localTransactionTreeItem.transaction;
        const attributeHeadings = Object.keys(transaction);
        let webText = `<thead><tr><th class="headingTH">Attribute <input type="text" id="searchBox" placeholder="Search Attribute..."/></th><th class="valueHeading">Value</th></tr></thead>`;
        webText += "<tbody>";
        for (const heading of attributeHeadings) {
          webText += `<tr><th class="colHeading">${heading}</th><td>${transaction[heading]}</td></tr>`;
        }
        webText += "</tbody>";

        const webviewHTML = getAttributesHtml(transaction.tranid, webText);

        const column = window.activeTextEditor
          ? window.activeTextEditor.viewColumn
          : undefined;
        const panel: WebviewPanel = window.createWebviewPanel(
          "zowe",
          `CICS Local Transaction ${localTransactionTreeItem.parentRegion.label}(${transaction.tranid})`,
          column || 1,
          { enableScripts: true }
        );
        panel.webview.html = webviewHTML;
      }
    }
  );
}
