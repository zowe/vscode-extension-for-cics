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
import { CICSLibraryDatasets } from "../trees/treeItems/CICSLibraryDatasets";
import { CICSLibraryTreeItem } from "../trees/treeItems/CICSLibraryTreeItem";
import { CICSLocalFileTreeItem } from "../trees/treeItems/CICSLocalFileTreeItem";
import { CICSProgramTreeItem } from "../trees/treeItems/CICSProgramTreeItem";
import { CICSTaskTreeItem } from "../trees/treeItems/CICSTaskTreeItem";
import { CICSTransactionTreeItem } from "../trees/treeItems/CICSTransactionTreeItem";
import { CICSTCPIPServiceTree } from "../trees/treeItems/web/CICSTCPIPService";
import { CICSTCPIPServiceTreeItem } from "../trees/treeItems/web/treeItems/CICSTCPIPServiceTreeItem";
import { CICSURIMapTreeItem } from "../trees/treeItems/web/treeItems/CICSURIMapTreeItem";
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
          webText += `<tr><th class="colHeading">${heading.toUpperCase()}</th><td>${localFile[heading]}</td></tr>`;
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
          webText += `<tr><th class="colHeading">${heading.toUpperCase()}</th><td>${transaction[heading]}</td></tr>`;
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

///@@@@@@@@@@@@@@ doesnt fit because actvtyid value is too long - edit css
export function getShowTaskAttributesCommand(treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.showTaskAttributes",
    async (node) => {
      const allSelectedNodes = findSelectedNodes(treeview, CICSTaskTreeItem, node);
      if (!allSelectedNodes || !allSelectedNodes.length) {
        window.showErrorMessage("No CICS Task selected");
        return;
      }
      for (const localTaskTreeItem of allSelectedNodes) {
        const task = localTaskTreeItem.task;
        const attributeHeadings = Object.keys(task);
        let webText = `<thead><tr><th class="headingTH">Attribute <input type="text" id="searchBox" placeholder="Search Attribute..."/></th><th class="valueHeading">Value</th></tr></thead>`;
        webText += "<tbody>";
        for (const heading of attributeHeadings) {
          webText += `<tr><th class="colHeading">${heading.toUpperCase()}</th><td>${task[heading]}</td></tr>`;
        }
        webText += "</tbody>";

        const webviewHTML = getAttributesHtml(task.task, webText);

        const column = window.activeTextEditor
          ? window.activeTextEditor.viewColumn
          : undefined;
        const panel: WebviewPanel = window.createWebviewPanel(
          "zowe",
          `CICS Task ${localTaskTreeItem.parentRegion.label}(${task.task})`,
          column || 1,
          { enableScripts: true }
        );
        panel.webview.html = webviewHTML;
      }
    }
  );
}

export function getShowLibraryAttributesCommand(treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.showLibraryAttributes",
    async (node) => {
      const allSelectedNodes = findSelectedNodes(treeview, CICSLibraryTreeItem, node);
      if (!allSelectedNodes || !allSelectedNodes.length) {
        window.showErrorMessage("No CICS library selected");
        return;
      }
      for (const libraryTreeItem of allSelectedNodes) {
        const library = libraryTreeItem.library;
        const attributeHeadings = Object.keys(library);
        let webText = `<thead><tr><th class="headingTH">Attribute <input type="text" id="searchBox" placeholder="Search Attribute..."/></th><th class="valueHeading">Value</th></tr></thead>`;
        webText += "<tbody>";
        for (const heading of attributeHeadings) {
          webText += `<tr><th class="colHeading">${heading.toUpperCase()}</th><td>${library[heading]}</td></tr>`;
        }
        webText += "</tbody>";
        
        const webviewHTML = getAttributesHtml(library.name, webText);
        const column = window.activeTextEditor
        ? window.activeTextEditor.viewColumn
        : undefined;
        const panel: WebviewPanel = window.createWebviewPanel(
          "zowe",
          `CICS Library ${libraryTreeItem.parentRegion.label}(${library.name})`,
          column || 1,
          { enableScripts: true }
          );
          panel.webview.html = webviewHTML;
        }
      }
  );
}

export function getShowLibraryDatasetsAttributesCommand(treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.showLibraryDatasetsAttributes",
    async (node) => {
      const allSelectedNodes = findSelectedNodes(treeview, CICSLibraryDatasets, node);
      if (!allSelectedNodes || !allSelectedNodes.length) {
        window.showErrorMessage("No CICS dataset selected");
        return;
      }
      for (const datasetTreeItem of allSelectedNodes) {
        const dataset = datasetTreeItem.dataset ;
        const attributeHeadings = Object.keys(dataset);
        let webText = `<thead><tr><th class="headingTH">Attribute <input type="text" id="searchBox" placeholder="Search Attribute..."/></th><th class="valueHeading">Value</th></tr></thead>`;
        webText += "<tbody>";
        for (const heading of attributeHeadings) {
          webText += `<tr><th class="colHeading">${heading.toUpperCase()}</th><td>${dataset [heading]}</td></tr>`;
        }
        webText += "</tbody>";
        
        const webviewHTML = getAttributesHtml(dataset.dsname, webText);
        const column = window.activeTextEditor
        ? window.activeTextEditor.viewColumn
        : undefined;
        const panel: WebviewPanel = window.createWebviewPanel(
          "zowe",
          `CICS Dataset ${datasetTreeItem.parentRegion.label}(${dataset.dsname})`,
          column || 1,
          { enableScripts: true }
          );
          panel.webview.html = webviewHTML;
        }
      }
  );
}

export function getShowTCPIPServiceAttributesCommand(treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.showTCPIPServiceAttributes",
    async (node) => {
      const allSelectedNodes = findSelectedNodes(treeview, CICSTCPIPServiceTreeItem, node);
      if (!allSelectedNodes || !allSelectedNodes.length) {
        window.showErrorMessage("No CICS TCPIP Service selected");
        return;
      }
      for (const tcpipsTreeItem of allSelectedNodes) {
        const tcpips = tcpipsTreeItem.tcpips;
        const attributeHeadings = Object.keys(tcpips);
        let webText = `<thead><tr><th class="headingTH">Attribute <input type="text" id="searchBox" placeholder="Search Attribute..."/></th><th class="valueHeading">Value</th></tr></thead>`;
        webText += "<tbody>";
        for (const heading of attributeHeadings) {
          webText += `<tr><th class="colHeading">${heading.toUpperCase()}</th><td>${tcpips[heading]}</td></tr>`;
        }
        webText += "</tbody>";
        
        const webviewHTML = getAttributesHtml(tcpips.name, webText);
        const column = window.activeTextEditor
        ? window.activeTextEditor.viewColumn
        : undefined;
        const panel: WebviewPanel = window.createWebviewPanel(
          "zowe",
          `CICS TCPIPS ${tcpipsTreeItem.parentRegion.label}(${tcpips.name})`,
          column || 1,
          { enableScripts: true }
          );
          panel.webview.html = webviewHTML;
        }
      }
  );
}

export function getShowURIMapAttributesCommand(treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.showURIMapAttributes",
    async (node) => {
      const allSelectedNodes = findSelectedNodes(treeview, CICSURIMapTreeItem, node);
      if (!allSelectedNodes || !allSelectedNodes.length) {
        window.showErrorMessage("No CICS URIMap selected");
        return;
      }
      for (const urimapTreeItem of allSelectedNodes) {
        const urimap = urimapTreeItem.urimap;
        const attributeHeadings = Object.keys(urimap);
        let webText = `<thead><tr><th class="headingTH">Attribute <input type="text" id="searchBox" placeholder="Search Attribute..."/></th><th class="valueHeading">Value</th></tr></thead>`;
        webText += "<tbody>";
        for (const heading of attributeHeadings) {
          webText += `<tr><th class="colHeading">${heading.toUpperCase()}</th><td>${urimap [heading]}</td></tr>`;
        }
        webText += "</tbody>";
        
        const webviewHTML = getAttributesHtml(urimap.name, webText);
        const column = window.activeTextEditor
        ? window.activeTextEditor.viewColumn
        : undefined;
        const panel: WebviewPanel = window.createWebviewPanel(
          "zowe",
          `CICS URIMap ${urimapTreeItem.parentRegion.label}(${urimap.name})`,
          column || 1,
          { enableScripts: true }
          );
          panel.webview.html = webviewHTML;
        }
      }
  );
}
