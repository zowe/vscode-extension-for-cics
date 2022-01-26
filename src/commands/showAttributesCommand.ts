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
import { CICSRegionTree } from "../trees/CICSRegionTree";
import { CICSProgramTreeItem } from "../trees/treeItems/CICSProgramTreeItem";
import { findSelectedNodes } from "../utils/commandUtils";
import { getAttributesHtml } from "../utils/webviewHTML";

export function getShowProgramAttributesCommand(treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.showProgramAttributes",
    async (node) => {
      const allSelectedNodes = findSelectedNodes(treeview, CICSProgramTreeItem, node);
      if (!allSelectedNodes || !allSelectedNodes.length) {
        window.showErrorMessage("No CICS program selected");
        return;
      }
      for (const programTreeItem of allSelectedNodes) {
        const program = programTreeItem.program;
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
          `CICS Program ${programTreeItem.parentRegion.label}(${program.program})`,
          column || 1,
          { enableScripts: true }
          );
          panel.webview.html = webviewHTML;
        }
      }
  );
}

export function getShowRegionAttributes(treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.showRegionAttributes",
    async (node) => {
      const allSelectedNodes = findSelectedNodes(treeview, CICSRegionTree, node);
      if (!allSelectedNodes || !allSelectedNodes.length) {
        window.showErrorMessage("No CICS region selected");
        return;
      }
      for (const regionTree of allSelectedNodes) {
        const region = regionTree.region;
        const attributeHeadings = Object.keys(region);
        let webText = `<thead><tr><th class="headingTH">Attribute <input type="text" id="searchBox" placeholder="Search Attribute..." /></th><th class="valueHeading">Value</th></tr></thead>`;
        webText += "<tbody>";
        for (const heading of attributeHeadings) {
          webText += `<tr><th class="colHeading">${heading.toUpperCase()}</th><td>${region[heading]}</td></tr>`;
        }
        webText += "</tbody>";

        const webviewHTML = getAttributesHtml(regionTree.getRegionName(), webText);

        const column = window.activeTextEditor
          ? window.activeTextEditor.viewColumn
          : undefined;
        const panel: WebviewPanel = window.createWebviewPanel(
          "zowe",
          `CICS Region ${regionTree.getRegionName()}`,
          column || 1,
          { enableScripts: true }
        );
        panel.webview.html = webviewHTML;
      }
    }
  );
}
