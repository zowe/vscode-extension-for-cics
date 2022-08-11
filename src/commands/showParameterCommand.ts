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
import { findSelectedNodes } from "../utils/commandUtils";
import { getResource } from "@zowe/cics-for-zowe-cli";
import { getParametersHtml } from "../utils/webviewHTML";

export function getShowRegionSITParametersCommand(treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.showRegionParameters",
    async (node) => {
      const allSelectedNodes = findSelectedNodes(treeview, CICSRegionTree, node);
      if (!allSelectedNodes || !allSelectedNodes.length) {
        window.showErrorMessage("No CICS region selected");
        return;
      }
      for (const regionTree of allSelectedNodes) {
        const db2transactionResponse = await getResource(regionTree.parentSession.session, {
          name: "CICSSystemParameter",
          regionName: regionTree.label,
          cicsPlex: regionTree.parentPlex ? regionTree.parentPlex!.getPlexName() : undefined,
          parameter: "PARMSRCE(COMBINED) PARMTYPE(SIT)"
        });
        // let webText = `<thead><tr><th class="headingTH">CICS Name <input type="text" id="searchBox" placeholder="Search Attribute..." /></th><th class="sourceHeading">Source<input type="text" id="searchBox" placeholder="Search Source..." /></th><th class="valueHeading">Value</th></tr></thead>`;
        let webText = `<thead><tr><th class="headingTH">CICS Name <input type="text" id="searchBox" placeholder="Search Attribute..." /></th>
        <th class="sourceHeading">Source
          <select id="filterSource" name="cars" id="cars">
            <option value="combined">Combined</option>
            <option value="console">Console</option>
            <option value="jcl">JCL</option>
            <option value="sysin">SYSIN</option>
            <option value="table">Table</option>
          </select>
        </th>
        <th class="valueHeading">Value</th></tr></thead>`;
        webText += "<tbody>";
        for (const systemParameter of db2transactionResponse.response.records.cicssystemparameter) {
          const attributeHeadings = Object.keys(systemParameter);
          webText += `<tr><th class="colHeading">${systemParameter.keyword.toUpperCase()}</th><td>${systemParameter.source.toUpperCase()}</td><td>${systemParameter.value.toUpperCase()}</td></tr>`;
        }
        webText += "</tbody>";
        const webviewHTML = getParametersHtml(regionTree.getRegionName(), webText);
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


