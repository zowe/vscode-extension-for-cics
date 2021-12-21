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

import { ProgressLocation, TreeItemCollapsibleState, window } from "vscode";
import { CICSCombinedLocalFileTree } from "../trees/CICSCombinedLocalFileTree";
import { CICSCombinedProgramTree } from "../trees/CICSCombinedProgramTree";
import { CICSCombinedTransactionsTree } from "../trees/CICSCombinedTransactionTree";
import { CICSPlexTree } from "../trees/CICSPlexTree";
import { CICSRegionsContainer } from "../trees/CICSRegionsContainer";
import { CICSRegionTree } from "../trees/CICSRegionTree";
import { CICSTree } from "../trees/CICSTree";
import { ProfileManagement } from "./profileManagement";

export function plexExpansionHandler(plex: CICSPlexTree, tree:CICSTree) {
    const plexProfile = plex.getProfile();
    const combinedProgramTree = new CICSCombinedProgramTree(plex);
    const combinedTransactionTree = new CICSCombinedTransactionsTree(plex);
    const combinedLocalFileTree = new CICSCombinedLocalFileTree(plex);
    if (plexProfile.profile!.regionName && plexProfile.profile!.cicsPlex) {
        if (!plex.getGroupName()) {
            // CICSRegion
            window.withProgress({
                title: 'Loading regions',
                location: ProgressLocation.Notification,
                cancellable: false
            }, async (_, token) => {
                token.onCancellationRequested(() => {
                console.log("Cancelling the loading of the regions");
                });
                await plex.loadOnlyRegion();
                tree._onDidChangeTreeData.fire(undefined);
            });
        } else {
            // CICSGroup
            window.withProgress({
                title: 'Loading region',
                location: ProgressLocation.Notification,
                cancellable: false
            }, async (_, token) => {
                token.onCancellationRequested(() => {
                console.log("Cancelling the loading of the region");
                });
                await plex.loadRegionsInCICSGroup(tree);
                //@ts-ignore
                const regionContainer: CICSRegionsContainer = plex.getChildren().filter((child:any) => child.contextValue.includes("cicsregionscontainer."))[0];
                if (regionContainer.getChildren().length > 1) {
                    const combinedProgramTree = new CICSCombinedProgramTree(plex);
                    const combinedTransactionTree = new CICSCombinedTransactionsTree(plex);
                    const combinedLocalFileTree = new CICSCombinedLocalFileTree(plex);
                    plex.addCombinedTree(combinedProgramTree);
                    plex.addCombinedTree(combinedTransactionTree);
                    plex.addCombinedTree(combinedLocalFileTree);
                }
                tree._onDidChangeTreeData.fire(undefined);
            });
        }
    } else {
        window.withProgress({
        title: 'Loading regions',
        location: ProgressLocation.Notification,
        cancellable: false
        }, async (_, token) => {
        token.onCancellationRequested(() => {
            console.log("Cancelling the loading of regions");
        });
        const regionInfo = await ProfileManagement.getRegionInfoInPlex(plex);
        if (regionInfo) {   
            plex.clearChildren();  
            let activeCount = 0;
            let totalCount = 0;
            const regionFilterRegex = plex.getActiveFilter() ? RegExp(plex.getActiveFilter()!) : undefined;
            plex.addRegionContainer();
            //@ts-ignore
            const regionContainer: CICSRegionsContainer = plex.getChildren().filter((child:any) => child.contextValue.includes("cicsregionscontainer."))[0];
            for (const region of regionInfo) {
            // If region filter exists then match it
            if (!regionFilterRegex || region.cicsname.match(regionFilterRegex)) {
                const newRegionTree = new CICSRegionTree(region.cicsname, region, plex.getParent(), plex);
                regionContainer.addRegion(newRegionTree);
                totalCount += 1;
                if (region.cicsstate === 'ACTIVE') {
                activeCount += 1;
                }
            }
            }
            if (regionContainer.getChildren().length > 1) {
            plex.addCombinedTree(combinedProgramTree);
            plex.addCombinedTree(combinedTransactionTree);
            plex.addCombinedTree(combinedLocalFileTree);
            }
            regionContainer.setLabel(`Regions [${activeCount}/${totalCount}]`);
            // Keep plex open after label change
            plex.collapsibleState = TreeItemCollapsibleState.Expanded;
        }
        tree._onDidChangeTreeData.fire(undefined);
        });
        }
    tree._onDidChangeTreeData.fire(undefined);
}