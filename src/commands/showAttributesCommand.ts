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

export function getShowAttributesCommand() {
  return commands.registerCommand(
    "cics-extension-for-zowe.showProgramAttributes",
    async (node) => {
      if (node) {
        const program = node.program;

        const attributeHeadings = Object.keys(program);
        let webText = `<thead><tr><th class="headingTH">Attribute <input type="text" id="searchBox" placeholder="Search Attribute..."/></th><th class="valueHeading">Value</th></tr></thead>`;
        webText += "<tbody>";
        for (const heading of attributeHeadings) {
          webText += `<tr><th class="colHeading">${heading.toUpperCase()}</th><td>${program[heading]}</td></tr>`;
        }
        webText += "</tbody>";

        const webviewHTML = getAttributesHtml(program.program, webText);
        const column = window.activeTextEditor
          ? window.activeTextEditor.viewColumn
          : undefined;
        const panel: WebviewPanel = window.createWebviewPanel(
          "zowe",
          `CICS Program ${node.parentRegion.label}(${program.program})`,
          column || 1,
          { enableScripts: true }
        );
        panel.webview.html = webviewHTML;
      } else {
        window.showErrorMessage("No CICS program selected");
      }
    }
  );
}

export function getShowRegionAttributes() {
  return commands.registerCommand(
    "cics-extension-for-zowe.showRegionAttributes",
    async (node) => {
      if (node) {
        const region = node.region;
        const attributeHeadings = Object.keys(region);
        let webText = `<thead><tr><th class="headingTH">Attribute <input type="text" id="searchBox" placeholder="Search Attribute..." /></th><th class="valueHeading">Value</th></tr></thead>`;
        webText += "<tbody>";
        for (const heading of attributeHeadings) {
          webText += `<tr><th class="colHeading">${heading.toUpperCase()}</th><td>${region[heading]}</td></tr>`;
        }
        webText += "</tbody>";

        const webviewHTML = getAttributesHtml(node.getRegionName(), webText);

        const column = window.activeTextEditor
          ? window.activeTextEditor.viewColumn
          : undefined;
        const panel: WebviewPanel = window.createWebviewPanel(
          "zowe",
          `CICS Region ${node.getRegionName()}`,
          column || 1,
          { enableScripts: true }
        );
        panel.webview.html = webviewHTML;
      } else {
        window.showErrorMessage("No CICS region selected");
      }
    }
  );
}
