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
import { CICSSessionTree } from "../trees/CICSSessionTree";
import { CICSTree } from "../trees/CICSTree";
import { ProfileManagement } from "./profileManagement";

export async function sessionExpansionHandler(session: CICSSessionTree, tree:CICSTree) {
    const profile = await ProfileManagement.getProfilesCache().getLoadedProfConfig(session.label?.toString()!);
    if (profile === undefined) {
        console.log(new Error("sessionExpansionHandler: Profile is not defined"));
    } else {
        await tree.loadProfile(profile, tree.getLoadedProfiles().indexOf(session), session);
    }
}

export function regionContainerExpansionHandler(regionContiner: CICSRegionsContainer, tree:CICSTree) {
    const parentPlex = regionContiner.getParent();
    const plexProfile = parentPlex.getProfile();
    if (plexProfile.profile!.regionName && plexProfile.profile!.cicsPlex) {
        if (parentPlex.getGroupName()) {
            // CICSGroup
            window.withProgress({
                title: 'Loading regions',
                location: ProgressLocation.Notification,
                cancellable: false
            }, async (_, token) => {
                token.onCancellationRequested(() => {
                console.log("Cancelling the loading of the regions");
                });
                regionContiner.clearChildren();
                await regionContiner.loadRegionsInCICSGroup(tree);
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
        regionContiner.clearChildren();
        await regionContiner.loadRegionsInPlex();
        if (!regionContiner.getChildren().length) {
            window.showInformationMessage(`No regions found for plex ${parentPlex.getPlexName()}`);
        }
        tree._onDidChangeTreeData.fire(undefined);
        });
    }
    tree._onDidChangeTreeData.fire(undefined);
}

export function plexExpansionHandler(plex: CICSPlexTree, tree:CICSTree) {
    const plexProfile = plex.getProfile();
    // Region name and plex name specified
    if (plexProfile.profile!.regionName && plexProfile.profile!.cicsPlex) {
        // If connection doesn't have a group name
        if (!plex.getGroupName()) {
            // Only 1 CICSRegion inside CICSPlex
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
        // CICSGroup
        } else {
            plex.clearChildren();
            plex.addRegionContainer();
            const regionsContainer = findRegionsContainerFromPlex(plex);
            // Run region container expansion handler by forcing execution
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

/**
 * Return a plex node's child 'Regions' container tree node.
 * @param plex plex tree node from where to start the search
 * @returns CICSRegionsContainer
 */
function findRegionsContainerFromPlex(plex: CICSPlexTree): CICSRegionsContainer {
    const regionsContainer = plex.children.filter(child => {
        if (child instanceof CICSRegionsContainer) {
            return child;
        }
    })[0] as CICSRegionsContainer;
    return regionsContainer;
}