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

import { commands, window, WebviewPanel } from "vscode";
import { getAttributesHtml } from "../utils/webviewHTML";

export function getShowTransactionAttributesCommand() {
  return commands.registerCommand(
    "cics-extension-for-zowe.showTransactionAttributes",
    async (node) => {
      if (node) {
        const transaction = node.transaction;

        const attributeHeadings = Object.keys(transaction);
        let webText = `<tr><th class="headingTH">Attribute <input type="text" id="searchBox" /></th><th class="valueHeading">Value</th></tr>`;
        for (const heading of attributeHeadings) {
          webText += `<tr><th class="colHeading">${heading}</th><td>${transaction[heading]}</td></tr>`;
        }

        const webviewHTML = getAttributesHtml(transaction.tranid, webText);

        const column = window.activeTextEditor
          ? window.activeTextEditor.viewColumn
          : undefined;
        const panel: WebviewPanel = window.createWebviewPanel(
          "zowe",
          `Attributes - ${transaction.tranid}`,
          column || 1,
          { enableScripts: true }
        );
        panel.webview.html = webviewHTML;
      } else {
        window.showErrorMessage("No CICS transaction selected");
      }
    }
  );
}
