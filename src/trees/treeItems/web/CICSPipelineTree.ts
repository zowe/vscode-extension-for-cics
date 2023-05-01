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
import { CICSPipelineTreeItem } from "./treeItems/CICSPipelineTreeItem";
import { CICSRegionTree } from "../../CICSRegionTree";
import { getResource } from "@zowe/cics-for-zowe-cli";
import * as https from "https";
import { toEscapedCriteriaString } from "../../../utils/filterUtils";
import { getIconPathInResources } from "../../../utils/profileUtils";
export class CICSPipelineTree extends TreeItem {
  children: CICSPipelineTreeItem[] = [];
  parentRegion: CICSRegionTree;
  activeFilter: string | undefined = undefined;

  constructor(parentRegion: CICSRegionTree, public iconPath = getIconPathInResources("folder-closed-dark.svg", "folder-closed-light.svg")) {
    super("Pipelines", TreeItemCollapsibleState.Collapsed);
    this.contextValue = `cicstreepipeline.${this.activeFilter ? "filtered" : "unfiltered"}.pipelines`;
    this.parentRegion = parentRegion;
  }

  public addPipeline(pipeline: CICSPipelineTreeItem) {
    this.children.push(pipeline);
  }

  public async loadContents() {
    const defaultCriteria = "(name=*)";
    let criteria;
    if (this.activeFilter) {
      criteria = toEscapedCriteriaString(this.activeFilter, "NAME");
    } else {
      criteria = defaultCriteria;
    }
    this.children = [];
    try {
      https.globalAgent.options.rejectUnauthorized = this.parentRegion.parentSession.session.ISession.rejectUnauthorized;

      const pipelineResponse = await getResource(this.parentRegion.parentSession.session, {
        name: "CICSPipeline",
        regionName: this.parentRegion.getRegionName(),
        cicsPlex: this.parentRegion.parentPlex ? this.parentRegion.parentPlex.getPlexName() : undefined,
        criteria: criteria,
      });
      https.globalAgent.options.rejectUnauthorized = undefined;
      const pipelinesArray = Array.isArray(pipelineResponse.response.records.cicspipeline)
        ? pipelineResponse.response.records.cicspipeline
        : [pipelineResponse.response.records.cicspipeline];
      this.label = `Pipelines${this.activeFilter ? ` (${this.activeFilter}) ` : " "}[${pipelinesArray.length}]`;
      for (const pipeline of pipelinesArray) {
        const newPipelineItem = new CICSPipelineTreeItem(pipeline, this.parentRegion, this);
        newPipelineItem.setLabel(newPipelineItem.label.toString().replace(pipeline.name, `${pipeline.name}`));
        this.addPipeline(newPipelineItem);
      }
      this.iconPath = getIconPathInResources("folder-open-dark.svg", "folder-open-light.svg");
    } catch (error) {
      https.globalAgent.options.rejectUnauthorized = undefined;
      if (error.mMessage!.includes("exceeded a resource limit")) {
        window.showErrorMessage(`Resource Limit Exceeded - Set a Pipeline filter to narrow search`);
      } else if (this.children.length === 0) {
        window.showInformationMessage(`No Pipelines found`);
        this.label = `Pipelines${this.activeFilter ? ` (${this.activeFilter}) ` : " "}[0]`;
      } else {
        window.showErrorMessage(
          `Something went wrong when fetching Pipelines - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(
            /(\\n\t|\\n|\\t)/gm,
            " "
          )}`
        );
      }
    }
  }

  public clearFilter() {
    this.activeFilter = undefined;
    this.contextValue = `cicstreepipeline.${this.activeFilter ? "filtered" : "unfiltered"}.pipelines`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public setFilter(newFilter: string) {
    this.activeFilter = newFilter;
    this.contextValue = `cicstreepipeline.${this.activeFilter ? "filtered" : "unfiltered"}.pipelines`;
    this.collapsibleState = TreeItemCollapsibleState.Expanded;
  }

  public getFilter() {
    return this.activeFilter;
  }

  public getParent() {
    return this.parentRegion;
  }
}
