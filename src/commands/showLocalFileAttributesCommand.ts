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
import { CICSLocalFileTreeItem } from "../trees/treeItems/CICSLocalFileTreeItem";
import { findSelectedNodes } from "../utils/commandUtils";
import { getAttributesHtml } from "../utils/webviewHTML";

export function getShowLocalFileAttributesCommand(treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.showLocalFileAttributes",
    async (node) => {
      const allSelectedNodes = findSelectedNodes(treeview, CICSLocalFileTreeItem, node);
      if (!allSelectedNodes || !allSelectedNodes.length) {
        window.showErrorMessage("No CICS local file selected");
        return;
      }
      for (const localFileTreeItem of allSelectedNodes) {
        const localFile = localFileTreeItem.localFile;
        const attributeHeadings = Object.keys(localFile);
        let webText = `<thead><tr><th class="headingTH">Attribute <input type="text" id="searchBox" placeholder="Search Attribute..."/></th><th class="valueHeading">Value</th></tr></thead>`;
        webText += "<tbody>";
        for (const heading of attributeHeadings) {
          webText += `<tr><th class="colHeading">${heading}</th><td>${localFile[heading]}</td></tr>`;
        }
        webText += "</tbody>";

        const webviewHTML = getAttributesHtml(localFile.file, webText);

        const column = window.activeTextEditor
          ? window.activeTextEditor.viewColumn
          : undefined;
        const panel: WebviewPanel = window.createWebviewPanel(
          "zowe",
          `CICS Local File ${localFileTreeItem.parentRegion.label}(${localFile.file})`,
          column || 1,
          { enableScripts: true }
        );
        panel.webview.html = webviewHTML;
      }
    }
  );
}
