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
import { CICSRegionsContainer } from "../trees/CICSRegionsContainer";
import { CICSTree } from "../trees/CICSTree";

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