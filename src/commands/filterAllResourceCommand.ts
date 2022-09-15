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

import { commands, TreeView, window } from "vscode";
import { CICSCombinedLibraryTree } from "../trees/CICSCombinedTrees/CICSCombinedLibraryTree";
import { CICSCombinedLocalFileTree } from "../trees/CICSCombinedTrees/CICSCombinedLocalFileTree";
import { CICSCombinedPipelineTree } from "../trees/CICSCombinedTrees/CICSCombinedPipelineTree";
import { CICSCombinedProgramTree } from "../trees/CICSCombinedTrees/CICSCombinedProgramTree";
import { CICSCombinedTaskTree } from "../trees/CICSCombinedTrees/CICSCombinedTaskTree";
import { CICSCombinedTCPIPServiceTree } from "../trees/CICSCombinedTrees/CICSCombinedTCPIPServiceTree";
import { CICSCombinedTransactionsTree } from "../trees/CICSCombinedTrees/CICSCombinedTransactionTree";
import { CICSCombinedURIMapTree } from "../trees/CICSCombinedTrees/CICSCombinedURIMapTree";
import { CICSCombinedWebServiceTree } from "../trees/CICSCombinedTrees/CICSCombinedWebServiceTree";
import { CICSTree } from "../trees/CICSTree";
import { getPatternFromFilter } from "../utils/filterUtils";
import { PersistentStorage } from "../utils/PersistentStorage";

export function getFilterAllProgramsCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.filterAllPrograms",
    async (node) => {
      const selection = treeview.selection;
      let chosenNode;
      if (node) {
        chosenNode = node;
      } else if (selection[selection.length-1] && selection[selection.length-1] instanceof CICSCombinedProgramTree) {
        chosenNode = selection[selection.length-1];
      } else { 
        window.showErrorMessage("No CICS 'All Programs' tree selected");
        return;
      }
      const persistentStorage = new PersistentStorage("zowe.cics.persistent");
      const pattern = await getPatternFromFilter("Program", persistentStorage.getProgramSearchHistory());
      if (!pattern) {
        return;
      }
      await persistentStorage.addProgramSearchHistory(pattern!);
      chosenNode.setFilter(pattern!);
      await chosenNode.loadContents(tree);
      tree._onDidChangeTreeData.fire(undefined);
    }
  );
}

export function getFilterAllTasksCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.filterAllTasks",
    async (node) => {
      const selection = treeview.selection;
      let chosenNode;
      if (node) {
        chosenNode = node;
      } else if (selection[selection.length-1] && selection[selection.length-1] instanceof CICSCombinedTaskTree) {
        chosenNode = selection[selection.length-1];
      } else { 
        window.showErrorMessage("No CICS 'All Tasks' tree selected");
        return;
      }
      const persistentStorage = new PersistentStorage("zowe.cics.persistent");
      const pattern = await getPatternFromFilter("Transaction ID", persistentStorage.getTransactionSearchHistory());
      if (!pattern) {
        return;
      }
      await persistentStorage.addTransactionSearchHistory(pattern!);
      chosenNode.setFilter(pattern!);
      await chosenNode.loadContents(tree);
      tree._onDidChangeTreeData.fire(undefined);
    }
  );
}

export function getFilterAllLibrariesCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.filterAllLibraries",
    async (node) => {
      const selection = treeview.selection;
      let chosenNode;
      if (node) {
        chosenNode = node;
      } else if (selection[selection.length-1] && selection[selection.length-1] instanceof CICSCombinedLibraryTree) {
        chosenNode = selection[selection.length-1];
      } else { 
        window.showErrorMessage("No CICS 'All Libraries' tree selected");
        return;
      }
      const persistentStorage = new PersistentStorage("zowe.cics.persistent");
      const pattern = await getPatternFromFilter("Library", persistentStorage.getLibrarySearchHistory());
      if (!pattern) {
        return;
      }
      await persistentStorage.addLibrarySearchHistory(pattern!);
      chosenNode.setFilter(pattern!);
      await chosenNode.loadContents(tree);
      tree._onDidChangeTreeData.fire(undefined);
    }
  );
}

export function getFilterAllTCPIPServicesCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.filterAllTCPIPServices",
    async (node) => {
      const selection = treeview.selection;
      let chosenNode;
      if (node) {
        chosenNode = node;
      } else if (selection[selection.length-1] && selection[selection.length-1] instanceof CICSCombinedTCPIPServiceTree) {
        chosenNode = selection[selection.length-1];
      } else { 
        window.showErrorMessage("No CICS 'All TCPIP Services' tree selected");
        return;
      }
      const persistentStorage = new PersistentStorage("zowe.cics.persistent");
      const pattern = await getPatternFromFilter("TCPIP Services", persistentStorage.getTCPIPSSearchHistory());
      if (!pattern) {
        return;
      }
      await persistentStorage.addTCPIPSSearchHistory(pattern!);
      chosenNode.setFilter(pattern!);
      await chosenNode.loadContents(tree);
      tree._onDidChangeTreeData.fire(undefined);
    }
  );
}

export function getFilterAllTransactionsCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.filterAllTransactions",
    async (node) => {
      const selection = treeview.selection;
      let chosenNode;
      if (node) {
        chosenNode = node;
      } else if (selection[selection.length-1] && selection[selection.length-1] instanceof CICSCombinedTransactionsTree) {
        chosenNode = selection[selection.length-1];
      } else { 
        window.showErrorMessage("No CICS 'All Transactions' tree selected");
        return;
      }
      const persistentStorage = new PersistentStorage("zowe.cics.persistent");
      const pattern = await getPatternFromFilter("Transaction", persistentStorage.getTransactionSearchHistory());
      if (!pattern) {
        return;
      }
      await persistentStorage.addTransactionSearchHistory(pattern!);
      chosenNode.setFilter(pattern!);
      await chosenNode.loadContents(tree);
      tree._onDidChangeTreeData.fire(undefined);
    }
  );
}

export function getFilterAllLocalFilesCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.filterAllLocalFiles",
    async (node) => {
      const selection = treeview.selection;
      let chosenNode;
      if (node) {
        chosenNode = node;
      } else if (selection[selection.length-1] && selection[selection.length-1] instanceof CICSCombinedLocalFileTree) {
        chosenNode = selection[selection.length-1];
      } else { 
        window.showErrorMessage("No CICS 'All Local Files' tree selected");
        return;
      }
      const persistentStorage = new PersistentStorage("zowe.cics.persistent");
      const pattern = await getPatternFromFilter("Local File", persistentStorage.getLocalFileSearchHistory());
      if (!pattern) {
        return;
      }
      await persistentStorage.addLocalFileSearchHistory(pattern!);
      chosenNode.setFilter(pattern!);
      await chosenNode.loadContents(tree);
      tree._onDidChangeTreeData.fire(undefined);
    }
  );
}

export function getFilterAllURIMapsCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.filterAllURIMaps",
    async (node) => {
      const selection = treeview.selection;
      let chosenNode;
      if (node) {
        chosenNode = node;
      } else if (selection[selection.length-1] && selection[selection.length-1] instanceof CICSCombinedURIMapTree) {
        chosenNode = selection[selection.length-1];
      } else { 
        window.showErrorMessage("No CICS 'All URI Maps' tree selected");
        return;
      }
      const persistentStorage = new PersistentStorage("zowe.cics.persistent");
      const pattern = await getPatternFromFilter("URI Map", persistentStorage.getURIMapSearchHistory());
      if (!pattern) {
        return;
      }
      await persistentStorage.addURIMapsSearchHistory(pattern!);
      chosenNode.setFilter(pattern!);
      await chosenNode.loadContents(tree);
      tree._onDidChangeTreeData.fire(undefined);
    }
  );
}

export function getFilterAllPipelinesCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.filterAllPipelines",
    async (node) => {
      const selection = treeview.selection;
      let chosenNode;
      if (node) {
        chosenNode = node;
      } else if (selection[selection.length-1] && selection[selection.length-1] instanceof CICSCombinedPipelineTree) {
        chosenNode = selection[selection.length-1];
      } else { 
        window.showErrorMessage("No CICS 'All Pipelines' tree selected");
        return;
      }
      const persistentStorage = new PersistentStorage("zowe.cics.persistent");
      const pattern = await getPatternFromFilter("Pipeline", persistentStorage.getPipelineSearchHistory());
      if (!pattern) {
        return;
      }
      await persistentStorage.addPipelineSearchHistory(pattern!);
      chosenNode.setFilter(pattern!);
      await chosenNode.loadContents(tree);
      tree._onDidChangeTreeData.fire(undefined);
    }
  );
}

export function getFilterAllWebServicesCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand(
    "cics-extension-for-zowe.filterAllWebServices",
    async (node) => {
      const selection = treeview.selection;
      let chosenNode;
      if(node) {
        chosenNode = node;
      } else if(selection[selection.length-1] && selection[selection.length-1] instanceof CICSCombinedWebServiceTree) {
        chosenNode = selection[selection.length-1];
      } else {
        window.showErrorMessage("No CICS 'All Web Services' tree selected");
        return;
      }
      const persistentStorage = new PersistentStorage("zowe.cics.persistent");
      const pattern = await getPatternFromFilter("Web Service", persistentStorage.getWebServiceSearchHistory());
      if(!pattern) {
        return;
      }
      await persistentStorage.addWebServiceSearchHistory(pattern!);
      chosenNode.setFilter(pattern!);
      await chosenNode.loadContents(tree);
      tree._onDidChangeTreeData.fire(undefined);
    }
  );
}