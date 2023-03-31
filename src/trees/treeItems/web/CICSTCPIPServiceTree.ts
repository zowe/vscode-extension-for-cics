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

import { TreeItemCollapsibleState, TreeItem, window } from "vscode";
import { CICSTCPIPServiceTreeItem } from "./treeItems/CICSTCPIPServiceTreeItem";
import { CICSRegionTree } from "../../CICSRegionTree";
import { getResource } from "@zowe/cics-for-zowe-cli";
import * as https from "https";
import { toEscapedCriteriaString } from "../../../utils/filterUtils";
import { getIconPathInResources } from "../../../utils/profileUtils";
export class CICSTCPIPServiceTree extends TreeItem {
  children: CICSTCPIPServiceTreeItem[] = [];
  parentRegion: CICSRegionTree;
  activeFilter: string | undefined = undefined;

  constructor(
    parentRegion: CICSRegionTree,
    public iconPath = getIconPathInResources("folder-closed-dark.svg", "folder-closed-light.svg")
  ) {
    super('TCPIP Services', TreeItemCollapsibleState.Collapsed);
    this.contextValue = `cicstreetcpips.${this.activeFilter ? 'filtered' : 'unfiltered'}.tcpips`;
    this.parentRegion = parentRegion;
  }

  public addTCPIPS(tcpips: CICSTCPIPServiceTreeItem) {
    this.children.push(tcpips);
  }

  public async loadContents() {
    let defaultCriteria = '(name=*)';
    let criteria;
    if (this.activeFilter) {
      criteria = toEscapedCriteriaString(this.activeFilter, 'NAME');
    } else {
      criteria = defaultCriteria;
    }
    this.children = [];
    try {

      https.globalAgent.options.rejectUnauthorized = this.parentRegion.parentSession.session.ISession.rejectUnauthorized;

      const tcpipsResponse = await getResource(this.parentRegion.parentSession.session, {
        name: "CICSTCPIPService",
        regionName: this.parentRegion.getRegionName(),
        cicsPlex: this.parentRegion.parentPlex ? this.parentRegion.parentPlex!.getPlexName() : undefined,
        criteria: criteria
      });
      https.globalAgent.options.rejectUnauthorized = undefined;
      const tcpipservicesArray = Array.isArray(tcpipsResponse.response.records.cicstcpipservice) ? tcpipsResponse.response.records.cicstcpipservice : [tcpipsResponse.response.records.cicstcpipservice];
      this.label = `TCPIP Services${this.activeFilter?` (${this.activeFilter}) `: " "}[${ tcpipservicesArray.length}]`;
      for (const tcpips of  tcpipservicesArray) {
        const newTCPIPServiceItem = new CICSTCPIPServiceTreeItem(tcpips, this.parentRegion, this);
        newTCPIPServiceItem.setLabel(newTCPIPServiceItem.label!.toString().replace(tcpips.name, `${tcpips.name} [Port #${newTCPIPServiceItem.tcpips.port}]`));
        this.addTCPIPS(newTCPIPServiceItem);
      }
      this.iconPath = getIconPathInResources("folder-open-dark.svg", "folder-open-light.svg");
    } catch (error) {
      https.globalAgent.options.rejectUnauthorized = undefined;
      if ((error as any)!.mMessage!.includes('exceeded a resource limit')) {
        window.showErrorMessage(`Resource Limit Exceeded - Set a TCPIPService filter to narrow search`);
      } else if ((this.children.length === 0)) {
        window.showInformationMessage(`No TCPIP Services found`);
        this.label = `TCPIP Services${this.activeFilter?` (${this.activeFilter}) `: " "}[0]`;
      } else {
        window.showErrorMessage(`Something went wrong when fetching TCPIP services - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(/(\\n\t|\\n|\\t)/gm," ")}`);
      }
    }

  }

  public clearFilter() {
    this.activeFilter = undefined;
    this.contextValue = `cicstreetcpips.${this.activeFilter ? 'filtered' : 'unfiltered'}.tcpips`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public setFilter(newFilter: string) {
    this.activeFilter = newFilter;
    this.contextValue = `cicstreetcpips.${this.activeFilter ? 'filtered' : 'unfiltered'}.tcpips`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public getFilter() {
    return this.activeFilter;
  }
  
  public getParent() {
    return this.parentRegion;
  }
}