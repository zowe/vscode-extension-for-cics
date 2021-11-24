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

import { TreeItemCollapsibleState, TreeItem, window, ProgressLocation, workspace } from "vscode";
import { join } from "path";
import { CICSPlexTree } from "./CICSPlexTree";
import { CICSProgramTreeItem } from "./treeItems/CICSProgramTreeItem";
import { CICSRegionTree } from "./CICSRegionTree";
import { CICSTree } from "./CICSTree";
import { ProfileManagement } from "../utils/profileManagement";

export class CICSCombinedProgramTree extends TreeItem {
  children: CICSProgramTreeItem[] | null;
  parentPlex: CICSPlexTree;
  activeFilter: string | undefined;

  constructor(
    parentPlex: CICSPlexTree,
    public iconPath = {
      light: join(
        __filename,
        "..",
        "..",
        "..",
        "resources",
        "imgs",
        "programs-dark.svg"
      ),
      dark: join(
        __filename,
        "..",
        "..",
        "..",
        "resources",
        "imgs",
        "programs-light.svg"
      ),
    }
  ) {
    super("All Programs", TreeItemCollapsibleState.Collapsed);
    this.contextValue = `cicscombinedprogramtree.`;
    this.parentPlex = parentPlex;
    this.children = [];
    this.activeFilter = undefined;
    }

    public async loadContents(tree : CICSTree){
      window.withProgress({
        title: 'Loading Programs',
        location: ProgressLocation.Notification,
        cancellable: true
      }, async (_, token) => {
        token.onCancellationRequested(() => {
          console.log("Cancelling the load");
        });
        let defaultCriteria = `${await workspace.getConfiguration().get('Zowe.CICS.Program.Filter')}`;
        if (!defaultCriteria || defaultCriteria.length === 0) {
          await workspace.getConfiguration().update('Zowe.CICS.Program.Filter', 'NOT (PROGRAM=CEE* OR PROGRAM=DFH* OR PROGRAM=CJ* OR PROGRAM=EYU* OR PROGRAM=CSQ* OR PROGRAM=CEL* OR PROGRAM=IGZ*)');
          defaultCriteria = 'NOT (PROGRAM=CEE* OR PROGRAM=DFH* OR PROGRAM=CJ* OR PROGRAM=EYU* OR PROGRAM=CSQ* OR PROGRAM=CEL* OR PROGRAM=IGZ*)';
        }
        const regionFilters = this.parentPlex.findResourceFilters();
        let criteria;
        const allPrograms = await ProfileManagement.getAllProgramsInPlex(this.parentPlex, defaultCriteria);
        let newChildren = [];
        for (const program of allPrograms) {
          const parentRegion = this.parentPlex.children.filter(child => {
            if (child instanceof CICSRegionTree) {
              return child.getRegionName() === program.eyu_cicsname;
            }
          })[0];
          //@ts-ignore
          const progamTree = new CICSProgramTreeItem(program,parentRegion);
          progamTree.setLabel(progamTree.label!.toString().replace(program.program, `${program.program} (${program.eyu_cicsname})`));
          newChildren.push(progamTree);
        }
        this.children = newChildren;
        tree._onDidChangeTreeData.fire(undefined);
        }
      );
    }

    public clearFilter() {
      this.activeFilter = undefined;
      // this.contextValue = `cicstreeprogram.${this.activeFilter ? 'filtered' : 'unfiltered'}.programs`;
      this.label = `All Programs`;
      this.collapsibleState = TreeItemCollapsibleState.Expanded;
    }
  
    public setFilter(newFilter: string) {
      this.activeFilter = newFilter;
      // this.contextValue = `cicstreeprogram.${this.activeFilter ? 'filtered' : 'unfiltered'}.programs`;
      this.label = `All Programs (${this.activeFilter})`;
      this.collapsibleState = TreeItemCollapsibleState.Expanded;
    }
}