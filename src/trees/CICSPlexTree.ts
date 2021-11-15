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

import { TreeItemCollapsibleState, TreeItem, window, ProgressLocation } from "vscode";
import { CICSRegionTree } from "./CICSRegionTree";
import { join } from "path";
import { ProfileManagement } from "../utils/profileManagement";
import { IProfileLoaded } from "@zowe/imperative";
import { CICSSessionTree } from "./CICSSessionTree";
import { CICSTree } from "./CICSTree";
import { getResource } from "@zowe/cics-for-zowe-cli";
import * as https from "https";

export class CICSPlexTree extends TreeItem {
  children: CICSRegionTree[] = [];
  plexName: string;
  profile: IProfileLoaded;
  parent: CICSSessionTree;

  constructor(
    plexName: string,
    profile: IProfileLoaded,
    sessionTree: CICSSessionTree,
    public readonly iconPath = {
      light: join(
        __filename,
        "..",
        "..",
        "..",
        "resources",
        "imgs",
        "list-dark.svg"
      ),
      dark: join(
        __filename,
        "..",
        "..",
        "..",
        "resources",
        "imgs",
        "list-light.svg"
      ),
    }
  ) {
    super(plexName, TreeItemCollapsibleState.Collapsed);
    this.plexName = plexName;
    this.profile = profile;
    this.parent = sessionTree;
    this.contextValue = `cicsplex.${plexName}`;
  }

  public addRegion(region: CICSRegionTree) {
    this.children.push(region);
  }

  public async filterRegions(pattern: string, tree: CICSTree) {
    this.children = [];
    const patternList = pattern.split(",");
    let patternString = "";
    for (const index in patternList) {
      patternString += `(^${patternList[index].replace("*","(.*)")})`;
      if (parseInt(index) !== patternList.length-1) {
        patternString += "|";
      }
    }
    const regex = new RegExp(patternString);
    this.setLabel(pattern === "*" ? `${this.plexName}` : `${this.plexName.split(' ')[0]} (${pattern})`);
    window.withProgress({
      title: 'Filtering regions',
      location: ProgressLocation.Notification,
      cancellable: true
    }, async (_, token) => {
      token.onCancellationRequested(() => {
        console.log("Cancelling the filter");
      });
      const regionInfo = await ProfileManagement.getRegionInfoInPlex(this);
      let totalCount = 0;
      let activeCount = 0;
      for (const region of regionInfo) {
        if (region.cicsname.match(regex)){
          const newRegionTree = new CICSRegionTree(
            region.cicsname, 
            region, 
            this.parent, 
            this);
          this.addRegion(newRegionTree);
          totalCount += 1;
            if (region.cicsstate === 'ACTIVE') {
              activeCount += 1;
            }
        }
      }
      const newLabel = pattern === "*" ? `${this.getPlexName()} [${activeCount}/${totalCount}]` : `${this.getPlexName()} (${pattern}) [${activeCount}/${totalCount}]`;
      this.setLabel(newLabel);
      tree._onDidChangeTreeData.fire(undefined);
      if (!this.children.length){
        window.showInformationMessage(`No regions found for ${this.getPlexName()}`);
      }
    });
  
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
    const newRegionTree = new CICSRegionTree(plexProfile.profile!.regionName, regionsObtained.response.records.cicsregion, this.getParent(), this);
    this.clearChildren(); 
    this.addRegion(newRegionTree);
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

  public clearChildren() {
    this.children = [];
  }

  public setLabel(label: string) {
    this.label = label;
    this.plexName = label;
  }
}
