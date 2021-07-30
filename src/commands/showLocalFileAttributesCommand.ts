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

export function getShowLocalFileAttributesCommand() {
  return commands.registerCommand(
    "cics-extension-for-zowe.showLocalFileAttributes",
    async (node) => {
      if (node) {
        const localFile = node.localFile;

        const attributeHeadings = Object.keys(localFile);
        let webText = `<tr><th class="headingTH">Attribute <input type="text" id="searchBox" /></th><th class="valueHeading">Value</th></tr>`;
        for (const heading of attributeHeadings) {
          webText += `<tr><th class="colHeading">${heading}</th><td>${localFile[heading]}</td></tr>`;
        }

        const webviewHTML = getAttributesHtml(localFile.file, webText);

        const column = window.activeTextEditor
          ? window.activeTextEditor.viewColumn
          : undefined;
        const panel: WebviewPanel = window.createWebviewPanel(
          "zowe",
          `Attributes - ${localFile.file}`,
          column || 1,
          { enableScripts: true }
        );
        panel.webview.html = webviewHTML;
      } else {
        window.showErrorMessage("No CICS Local File selected");
      }
    }
  );
}
