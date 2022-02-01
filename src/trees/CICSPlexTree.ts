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

import { TreeItemCollapsibleState, TreeItem } from "vscode";
import { CICSRegionTree } from "./CICSRegionTree";
import { IProfileLoaded } from "@zowe/imperative";
import { CICSSessionTree } from "./CICSSessionTree";
import { getResource } from "@zowe/cics-for-zowe-cli";
import * as https from "https";
import { CICSCombinedProgramTree } from "./CICSCombinedProgramTree";
import { CICSCombinedTransactionsTree } from "./CICSCombinedTransactionTree";
import { CICSCombinedLocalFileTree } from "./CICSCombinedLocalFileTree";
import { CICSRegionsContainer } from "./CICSRegionsContainer";
import { getIconPathInResources } from "../utils/getIconPath";

export class CICSPlexTree extends TreeItem {
  children: (CICSRegionTree | CICSCombinedProgramTree | CICSCombinedTransactionsTree | CICSCombinedLocalFileTree | CICSRegionsContainer) [] = [];
  plexName: string;
  profile: IProfileLoaded;
  parent: CICSSessionTree;
  resourceFilters: any;
  activeFilter: string | undefined;
  groupName: string | undefined;

  constructor(
    plexName: string,
    profile: IProfileLoaded,
    sessionTree: CICSSessionTree,
    group?: string,
  ) {
    super(plexName, TreeItemCollapsibleState.Collapsed);
    this.plexName = plexName;
    this.profile = profile;
    this.parent = sessionTree;
    this.contextValue = `cicsplex.${plexName}`;
    this.resourceFilters = {};
    this.activeFilter = undefined;
    this.groupName = group;
    this.iconPath = 
      group ? 
      getIconPathInResources("cics-system-group-dark.svg ", "cics-system-group-light.svg ") : 
      getIconPathInResources("cics-plex-dark.svg", "cics-plex-light.svg");
  }

  public addRegion(region: CICSRegionTree) {
    this.children.push(region);
  }

  public async loadOnlyRegion() {
    const plexProfile = this.getProfile();
    https.globalAgent.options.rejectUnauthorized = plexProfile.profile!.rejectUnauthorized;
    const session = this.getParent().getSession();
    const regionsObtained = await getResource(session, {
        name: "CICSRegion",
        cicsPlex: plexProfile.profile!.cicsPlex,
        regionName: plexProfile.profile!.regionName
    });
    https.globalAgent.options.rejectUnauthorized = undefined;
    const newRegionTree = new CICSRegionTree(
      plexProfile.profile!.regionName,
      regionsObtained.response.records.cicsregion,
      this.getParent(),
      this
      );
    this.clearChildren(); 
    this.addRegion(newRegionTree);
  }

  // // Store all filters on children resources
  // public findResourceFilters() {
  //   const regionsContainer = this.children.filter(child => child instanceof CICSRegionsContainer)[0];
  //   if (regionsContainer){
  //     for (const region of regionsContainer.getChildren()!) {
  //       if (region instanceof CICSRegionTree) {
  //         if (region.children) {
  //           for (const resourceTree of region.children) {
  //             const filter = resourceTree.getFilter();
  //             if (filter) {
  //               this.resourceFilters[region.getRegionName()] = {[resourceTree.label!.toString().split(' ')[0]]: filter};
  //             } else {
  //               this.resourceFilters[region.getRegionName()] = {[resourceTree.label!.toString().split(' ')[0]]: undefined};
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  // }

  // public async reapplyFilter() {
  //   const regionsContainer = this.children.filter(child => child instanceof CICSRegionsContainer)[0];
  //   for (const region of regionsContainer.getChildren()!) {
  //     if (region instanceof CICSRegionTree) {
  //       const resourceFilters = this.getResourceFilter(region.getRegionName());
  //       if (resourceFilters) {
  //         for (const resourceTree of region.children!) {
  //           if (resourceFilters[resourceTree.label!.toString().split(' ')[0]]) {
  //             resourceTree.setFilter(resourceFilters[resourceTree.label!.toString()]);
  //             await resourceTree.loadContents();
  //             resourceTree.collapsibleState = TreeItemCollapsibleState.Expanded;
  //           }
  //         }
  //       }
  //     }
  //   }
  // }

  public getResourceFilter(regionName: string) {
    return this.resourceFilters[regionName];
  }

  public getPlexName() {
    return this.plexName.split(' ')[0];
  }

  public getProfile() {
    return this.profile;
  }

  public getParent() {
    return this.parent;
  }

  public getChildren() {
    return this.children;
  }

  public clearChildren() {
    this.children = [];
  }

  public setLabel(label: string) {
    this.label = label;
    //this.plexName = label;
  }

  public getActiveFilter() {
    return this.activeFilter;
  }

  public addNewCombinedTrees(){
    this.children.push(new CICSCombinedProgramTree(this));
    this.children.push(new CICSCombinedTransactionsTree(this));
    this.children.push(new CICSCombinedLocalFileTree(this));
  }

  public addRegionContainer() {
    this.children.push(new CICSRegionsContainer(this));
  }

  public getGroupName() {
    return this.groupName;
  }
}
