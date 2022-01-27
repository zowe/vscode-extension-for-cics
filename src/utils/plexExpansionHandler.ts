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

import { ProgressLocation, window } from "vscode";
import { CICSPlexTree } from "../trees/CICSPlexTree";
import { CICSRegionsContainer } from "../trees/CICSRegionsContainer";
import { CICSTree } from "../trees/CICSTree";
import { regionContainerExpansionHandler } from "./regionContainerExpansionHandler";

export function plexExpansionHandler(plex: CICSPlexTree, tree:CICSTree) {
    const plexProfile = plex.getProfile();
    // Region name and plex name specified
    if (plexProfile.profile!.regionName && plexProfile.profile!.cicsPlex) {
        if (!plex.getGroupName()) {
            // CICSRegion
            window.withProgress({
                title: 'Loading region',
                location: ProgressLocation.Notification,
                cancellable: false
            }, async (_, token) => {
                token.onCancellationRequested(() => {
                console.log("Cancelling the loading of the region");
                });
                await plex.loadOnlyRegion();
                tree._onDidChangeTreeData.fire(undefined);
            });
        } else {
            // CICSGroup
            plex.clearChildren();
            plex.addRegionContainer();
            const regionsContainer = findRegionsContainerFromPlex(plex);
            regionContainerExpansionHandler(regionsContainer, tree);
            plex.addNewCombinedTrees();
            tree._onDidChangeTreeData.fire(undefined);
        }
    } else {
        plex.clearChildren();
        plex.addRegionContainer();
        const regionsContainer = findRegionsContainerFromPlex(plex);
        regionContainerExpansionHandler(regionsContainer, tree);
        plex.addNewCombinedTrees();
        tree._onDidChangeTreeData.fire(undefined);
        }
    tree._onDidChangeTreeData.fire(undefined);
}

function findRegionsContainerFromPlex(plex: CICSPlexTree): CICSRegionsContainer {
    const regionsContainer = plex.children.filter(child => {
        if (child instanceof CICSRegionsContainer) {
            return child;
        }
    })[0];
    //@ts-ignore
    return regionsContainer;
}