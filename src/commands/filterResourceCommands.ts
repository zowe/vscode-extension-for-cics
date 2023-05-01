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

import { commands, ProgressLocation, TreeView, window } from "vscode";
import { CICSLibraryTree } from "../trees/CICSLibraryTree";
import { CICSLocalFileTree } from "../trees/CICSLocalFileTree";
import { CICSProgramTree } from "../trees/CICSProgramTree";
import { CICSTaskTree } from "../trees/CICSTaskTree";
import { CICSTransactionTree } from "../trees/CICSTransactionTree";
import { CICSTree } from "../trees/CICSTree";
import { CICSTCPIPServiceTree } from "../trees/treeItems/web/CICSTCPIPServiceTree";
import { CICSLibraryDatasets } from "../trees/treeItems/CICSLibraryDatasets";
import { CICSLibraryTreeItem } from "../trees/treeItems/CICSLibraryTreeItem";
import { getPatternFromFilter } from "../utils/filterUtils";
import { PersistentStorage } from "../utils/PersistentStorage";
import { CICSURIMapTree } from "../trees/treeItems/web/CICSURIMapTree";
import { CICSPipelineTree } from "../trees/treeItems/web/CICSPipelineTree";
import { CICSWebServiceTree } from "../trees/treeItems/web/CICSWebServiceTree";

export function getFilterLibrariesCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand("cics-extension-for-zowe.filterLibraries", async (node) => {
    const selection = treeview.selection;
    let chosenNode: CICSLibraryTree;
    if (node) {
      chosenNode = node;
    } else if (selection[selection.length - 1] && selection[selection.length - 1] instanceof CICSLibraryTree) {
      chosenNode = selection[selection.length - 1];
    } else {
      window.showErrorMessage("No CICS library tree selected");
      return;
    }
    const persistentStorage = new PersistentStorage("zowe.cics.persistent");
    const pattern = await getPatternFromFilter("Library", persistentStorage.getLibrarySearchHistory());
    if (!pattern) {
      return;
    }
    await persistentStorage.addLibrarySearchHistory(pattern);
    chosenNode.setFilter(pattern);
    window.withProgress(
      {
        title: "Loading Libraries",
        location: ProgressLocation.Notification,
        cancellable: false,
      },
      async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the loading of libraries");
        });
        await chosenNode.loadContents();
        tree._onDidChangeTreeData.fire(undefined);
      }
    );
  });
}

export function getFilterDatasetsCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand("cics-extension-for-zowe.filterDatasets", async (node) => {
    const selection = treeview.selection;
    let chosenNode: CICSLibraryTreeItem;
    if (node) {
      chosenNode = node;
    } else if (selection[selection.length - 1] && selection[selection.length - 1] instanceof CICSLibraryTreeItem) {
      chosenNode = selection[selection.length - 1];
    } else {
      window.showErrorMessage("No CICS library tree item selected");
      return;
    }
    const persistentStorage = new PersistentStorage("zowe.cics.persistent");
    const pattern = await getPatternFromFilter("Dataset", persistentStorage.getDatasetSearchHistory());
    if (!pattern) {
      return;
    }
    await persistentStorage.addDatasetSearchHistory(pattern);
    chosenNode.setFilter(pattern);
    window.withProgress(
      {
        title: "Loading Datasets here",
        location: ProgressLocation.Notification,
        cancellable: false,
      },
      async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the loading of datasets");
        });
        await chosenNode.loadContents();
        tree._onDidChangeTreeData.fire(undefined);
      }
    );
  });
}

export function getFilterProgramsCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand("cics-extension-for-zowe.filterPrograms", async (node) => {
    const selection = treeview.selection;
    let chosenNode: CICSProgramTree;
    if (node) {
      chosenNode = node;
    } else if (selection[selection.length - 1] && selection[selection.length - 1] instanceof CICSProgramTree) {
      chosenNode = selection[selection.length - 1];
    } else {
      window.showErrorMessage("No CICS program tree selected");
      return;
    }
    const persistentStorage = new PersistentStorage("zowe.cics.persistent");
    const pattern = await getPatternFromFilter("Program", persistentStorage.getProgramSearchHistory());
    if (!pattern) {
      return;
    }
    await persistentStorage.addProgramSearchHistory(pattern);
    chosenNode.setFilter(pattern);
    window.withProgress(
      {
        title: "Loading Programs",
        location: ProgressLocation.Notification,
        cancellable: false,
      },
      async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the loading of programs");
        });
        await chosenNode.loadContents();
        tree._onDidChangeTreeData.fire(undefined);
      }
    );
  });
}

export function getFilterDatasetProgramsCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand("cics-extension-for-zowe.filterDatasetPrograms", async (node) => {
    const selection = treeview.selection;
    let chosenNode: CICSLibraryDatasets;
    if (node) {
      chosenNode = node;
    } else if (selection[selection.length - 1] && selection[selection.length - 1] instanceof CICSLibraryDatasets) {
      chosenNode = selection[selection.length - 1];
    } else {
      window.showErrorMessage("No CICS Dataset tree selected");
      return;
    }
    const persistentStorage = new PersistentStorage("zowe.cics.persistent");
    const pattern = await getPatternFromFilter("Program", persistentStorage.getProgramSearchHistory());
    if (!pattern) {
      return;
    }
    await persistentStorage.addProgramSearchHistory(pattern);
    chosenNode.setFilter(pattern);
    window.withProgress(
      {
        title: "Loading Programs",
        location: ProgressLocation.Notification,
        cancellable: false,
      },
      async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the loading of programs");
        });
        await chosenNode.loadContents();
        tree._onDidChangeTreeData.fire(undefined);
      }
    );
  });
}

export function getFilterLocalFilesCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand("cics-extension-for-zowe.filterLocalFiles", async (node) => {
    const selection = treeview.selection;
    let chosenNode: CICSLocalFileTree;
    if (node) {
      chosenNode = node;
    } else if (selection[selection.length - 1] && selection[selection.length - 1] instanceof CICSLocalFileTree) {
      chosenNode = selection[selection.length - 1];
    } else {
      window.showErrorMessage("No CICS local file tree selected");
      return;
    }
    const persistentStorage = new PersistentStorage("zowe.cics.persistent");
    const pattern = await getPatternFromFilter("Local File", persistentStorage.getLocalFileSearchHistory());
    if (!pattern) {
      return;
    }
    await persistentStorage.addLocalFileSearchHistory(pattern);
    chosenNode.setFilter(pattern);
    window.withProgress(
      {
        title: "Loading Local Files",
        location: ProgressLocation.Notification,
        cancellable: false,
      },
      async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the loading of local files");
        });
        await chosenNode.loadContents();
        tree._onDidChangeTreeData.fire(undefined);
      }
    );
  });
}

export function getFilterTasksCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand("cics-extension-for-zowe.filterTasks", async (node) => {
    const selection = treeview.selection;
    let chosenNode: CICSTaskTree;
    if (node) {
      chosenNode = node;
    } else if (selection[selection.length - 1] && selection[selection.length - 1] instanceof CICSTaskTree) {
      chosenNode = selection[selection.length - 1];
    } else {
      window.showErrorMessage("No CICS task tree selected");
      return;
    }
    const persistentStorage = new PersistentStorage("zowe.cics.persistent");
    const pattern = await getPatternFromFilter("Transaction ID", persistentStorage.getTransactionSearchHistory());
    if (!pattern) {
      return;
    }
    await persistentStorage.addTransactionSearchHistory(pattern);
    chosenNode.setFilter(pattern);
    window.withProgress(
      {
        title: "Loading Tasks",
        location: ProgressLocation.Notification,
        cancellable: false,
      },
      async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the loading of tasks");
        });
        await chosenNode.loadContents();
        tree._onDidChangeTreeData.fire(undefined);
      }
    );
  });
}

export function getFilterTransactionCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand("cics-extension-for-zowe.filterTransactions", async (node) => {
    const selection = treeview.selection;
    let chosenNode: CICSTransactionTree;
    if (node) {
      chosenNode = node;
    } else if (selection[selection.length - 1] && selection[selection.length - 1] instanceof CICSTransactionTree) {
      chosenNode = selection[selection.length - 1];
    } else {
      window.showErrorMessage("No CICS transaction tree selected");
      return;
    }
    const persistentStorage = new PersistentStorage("zowe.cics.persistent");
    const pattern = await getPatternFromFilter("Transaction", persistentStorage.getTransactionSearchHistory());
    if (!pattern) {
      return;
    }
    await persistentStorage.addTransactionSearchHistory(pattern);
    chosenNode.setFilter(pattern);
    window.withProgress(
      {
        title: "Loading Transactions",
        location: ProgressLocation.Notification,
        cancellable: false,
      },
      async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the loading of transactions");
        });
        await chosenNode.loadContents();
        tree._onDidChangeTreeData.fire(undefined);
      }
    );
  });
}

export function getFilterTCPIPSCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand("cics-extension-for-zowe.filterTCPIPServices", async (node) => {
    const selection = treeview.selection;
    let chosenNode: CICSTCPIPServiceTree;
    if (node) {
      chosenNode = node;
    } else if (selection[selection.length - 1] && selection[selection.length - 1] instanceof CICSTCPIPServiceTree) {
      chosenNode = selection[selection.length - 1];
    } else {
      window.showErrorMessage("No CICS TCPIP Service tree selected");
      return;
    }
    const persistentStorage = new PersistentStorage("zowe.cics.persistent");
    const pattern = await getPatternFromFilter("TCPIP Services", persistentStorage.getTCPIPSSearchHistory());
    if (!pattern) {
      return;
    }
    await persistentStorage.addTCPIPSSearchHistory(pattern);
    chosenNode.setFilter(pattern);
    window.withProgress(
      {
        title: "Loading TCPIP Services",
        location: ProgressLocation.Notification,
        cancellable: false,
      },
      async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the loading of TCPIP Services");
        });
        await chosenNode.loadContents();
        tree._onDidChangeTreeData.fire(undefined);
      }
    );
  });
}

export function getFilterURIMapsCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand("cics-extension-for-zowe.filterURIMaps", async (node) => {
    const selection = treeview.selection;
    let chosenNode: CICSURIMapTree;
    if (node) {
      chosenNode = node;
    } else if (selection[selection.length - 1] && selection[selection.length - 1] instanceof CICSURIMapTree) {
      chosenNode = selection[selection.length - 1];
    } else {
      window.showErrorMessage("No CICS URI Maps tree selected");
      return;
    }
    const persistentStorage = new PersistentStorage("zowe.cics.persistent");
    const pattern = await getPatternFromFilter("URI Maps", persistentStorage.getURIMapSearchHistory());
    if (!pattern) {
      return;
    }
    await persistentStorage.addURIMapsSearchHistory(pattern);
    chosenNode.setFilter(pattern);
    window.withProgress(
      {
        title: "Loading URI Maps",
        location: ProgressLocation.Notification,
        cancellable: false,
      },
      async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the loading of URI Maps");
        });
        await chosenNode.loadContents();
        tree._onDidChangeTreeData.fire(undefined);
      }
    );
  });
}

export function getFilterPipelinesCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand("cics-extension-for-zowe.filterPipelines", async (node) => {
    const selection = treeview.selection;
    let chosenNode: CICSPipelineTree;
    if (node) {
      chosenNode = node;
    } else if (selection[selection.length - 1] && selection[selection.length - 1] instanceof CICSPipelineTree) {
      chosenNode = selection[selection.length - 1];
    } else {
      window.showErrorMessage("No CICS Pipelines tree selected");
      return;
    }
    const persistentStorage = new PersistentStorage("zowe.cics.persistent");
    const pattern = await getPatternFromFilter("Pipelines", persistentStorage.getPipelineSearchHistory());
    if (!pattern) {
      return;
    }
    await persistentStorage.addPipelineSearchHistory(pattern);
    chosenNode.setFilter(pattern);
    window.withProgress(
      {
        title: "Loading Pipelines",
        location: ProgressLocation.Notification,
        cancellable: false,
      },
      async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the loading of Pipelines");
        });
        await chosenNode.loadContents();
        tree._onDidChangeTreeData.fire(undefined);
      }
    );
  });
}

export function getFilterWebServicesCommand(tree: CICSTree, treeview: TreeView<any>) {
  return commands.registerCommand("cics-extension-for-zowe.filterWebServices", async (node) => {
    const selection = treeview.selection;
    let chosenNode: CICSWebServiceTree;
    if (node) {
      chosenNode = node;
    } else if (selection[selection.length - 1] && selection[selection.length - 1] instanceof CICSWebServiceTree) {
      chosenNode = selection[selection.length - 1];
    } else {
      window.showErrorMessage("No CICS Web Services tree selected");
      return;
    }
    const persistentStorage = new PersistentStorage("zowe.cics.persistent");
    const pattern = await getPatternFromFilter("Web Services", persistentStorage.getWebServiceSearchHistory());
    if (!pattern) {
      return;
    }
    await persistentStorage.addWebServiceSearchHistory(pattern);
    chosenNode.setFilter(pattern);
    window.withProgress(
      {
        title: "Loading Web Services",
        location: ProgressLocation.Notification,
        cancellable: false,
      },
      async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the loading of Web Services");
        });
        await chosenNode.loadContents();
        tree._onDidChangeTreeData.fire(undefined);
      }
    );
  });
}
