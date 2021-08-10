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

import { getResource } from "@zowe/cics-for-zowe-cli";
import { IProfileLoaded, Session } from "@zowe/imperative";
import { Event, EventEmitter, ProviderResult, TreeDataProvider, TreeItem, WebviewPanel, window } from "vscode";
import { PersistentStorage } from "../utils/PersistentStorage";
import { ProfileManagement } from "../utils/profileManagement";
import { addProfileHtml } from "../utils/webviewHTML";
import { CICSPlexTree } from "./CICSPlexTree";
import { CICSRegionTree } from "./CICSRegionTree";
import { CICSSessionTree } from "./CICSSessionTree";

export class CICSTree
    implements TreeDataProvider<CICSSessionTree>{

    loadedProfiles: CICSSessionTree[] = [];
    constructor() {
        this.loadStoredProfiles();
    }

    public async loadStoredProfiles() {
        const persistentStorage = new PersistentStorage("Zowe.CICS.Persistent");
        for (const profilename of persistentStorage.getLoadedCICSProfile()){
            const profileToLoad = ProfileManagement.getProfilesCache().loadNamedProfile(profilename, 'cics');
            await this.loadProfile(profileToLoad);
        }
    }

    async addProfile() {

        const allCICSProfileNames = await ProfileManagement.getProfilesCache().getNamesForType('cics');
        if (allCICSProfileNames.length > 0) {
            const profileNameToLoad = await window.showQuickPick(
                [{ label: "\uFF0B Create New CICS Profile..." }].concat(allCICSProfileNames.filter((profile) => {
                    for (const loadedProfile of this.loadedProfiles) {
                        if (loadedProfile.label === profile) {
                            return false;
                        }
                    }
                    return true;
                }).map(profileName => {
                    return { label: profileName };
                })),
                {
                    ignoreFocusOut: true,
                    placeHolder: "Load Profile or Create New Profile",
                }
            );

            if (profileNameToLoad) {
                if (profileNameToLoad.label.includes("\uFF0B")) {
                    //  Create New Profile Form should appear

                    this.createNewProfile();

                } else {
                    const profileToLoad = ProfileManagement.getProfilesCache().loadNamedProfile(profileNameToLoad.label, 'cics');
                    this.loadProfile(profileToLoad);
                }
            }
        } else {
            window.showInformationMessage(
                "No Profiles Found... Opening Profile Creation Form"
            );
            //  Create New Profile Form should appear

            this.createNewProfile();

        }

    }

    async loadProfile(profile: IProfileLoaded) {

        const persistentStorage = new PersistentStorage("Zowe.CICS.Persistent");
        await persistentStorage.addLoadedCICSProfile(profile.name!);
        
        const plexInfo = await ProfileManagement.getPlexInfo(profile);
        const newSessionTree = new CICSSessionTree(profile);
        for (const item of plexInfo) {
            if (item.plexname === null) {

                const session = new Session({
                    type: "basic",
                    hostname: profile.profile!.host,
                    port: Number(profile.profile!.port),
                    user: profile.profile!.user,
                    password: profile.profile!.password,
                    rejectUnauthorized: profile.profile!.rejectUnauthorized,
                    protocol: profile.profile!.protocol,
                });

                const regionsObtained = await getResource(session, {
                    name: "CICSRegion",
                    regionName: item.regions[0].applid
                });

                const newRegionTree = new CICSRegionTree(item.regions[0].applid, regionsObtained.response.records.cicsregion, newSessionTree, undefined);
                newSessionTree.addRegion(newRegionTree);
            } else {
                const newPlexTree = new CICSPlexTree(item.plexname);
                for (const regionInPlex of item.regions) {
                    const newRegionTree = new CICSRegionTree(regionInPlex.cicsname, regionInPlex, newSessionTree, newPlexTree);
                    newPlexTree.addRegion(newRegionTree);
                }
                newSessionTree.addPlex(newPlexTree);
            }
        }
        this.loadedProfiles.push(newSessionTree);
        this._onDidChangeTreeData.fire(undefined);

    }

    async createNewProfile() {

        const column = window.activeTextEditor
            ? window.activeTextEditor.viewColumn
            : undefined;
        const panel: WebviewPanel = window.createWebviewPanel(
            "zowe",
            `Create CICS Profile`,
            column || 1,
            { enableScripts: true }
        );
        panel.webview.html = addProfileHtml();

        panel.webview.onDidReceiveMessage(async (message) => {
            try {
                panel.dispose();
                await ProfileManagement.createNewProfile(message);
                await this.loadProfile(ProfileManagement.getProfilesCache().loadNamedProfile(message.name, 'cics'));
            } catch (error) {
                window.showErrorMessage(error.message);
            }
        });

    }

    async removeSession(session: CICSSessionTree) {
        const persistentStorage = new PersistentStorage("Zowe.CICS.Persistent");
        await persistentStorage.removeLoadedCICSProfile(session.label!.toString());


        this.loadedProfiles = this.loadedProfiles.filter(profile => profile !== session);
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: CICSSessionTree): TreeItem | Thenable<TreeItem> {
        return element;
    }
    getChildren(element?: CICSSessionTree): ProviderResult<any[]> {
        return element === undefined ? this.loadedProfiles : element!.children;
    }

    public _onDidChangeTreeData: EventEmitter<any | undefined> = new EventEmitter<
        any | undefined
    >();
    readonly onDidChangeTreeData: Event<any | undefined> =
        this._onDidChangeTreeData.event;
}