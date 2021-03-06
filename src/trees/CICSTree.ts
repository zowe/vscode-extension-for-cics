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
import { IProfileLoaded, IUpdateProfile, Session } from "@zowe/imperative";
import { Event, EventEmitter, ProgressLocation, ProviderResult, TreeDataProvider, TreeItem, WebviewPanel, window } from "vscode";
import { PersistentStorage } from "../utils/PersistentStorage";
import { ProfileManagement } from "../utils/profileManagement";
import { isTheia } from "../utils/theiaCheck";
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
        for (const profilename of persistentStorage.getLoadedCICSProfile()) {
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

    async loadProfile(profile: IProfileLoaded, position?: number) {

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
        if (position || position === 0) {
            this.loadedProfiles.splice(position, 0, newSessionTree);
        } else {
            this.loadedProfiles.push(newSessionTree);
        }
        this._onDidChangeTreeData.fire(undefined);

    }

    async createNewProfile() {
        if (isTheia()) {
            const connnectionName = await window.showInputBox({
                title: "Name of connection",
                placeHolder: "e.g. my-cics-profile",
                ignoreFocusOut: true
            });
            if (!connnectionName) {
                return;
            }
            const hostDetails = await window.showInputBox({
                title: "Input protocol, host and port for connection",
                placeHolder: "e.g. https://mycicshostname.com:12345",
                ignoreFocusOut: true
            });

            if (!hostDetails) {
                return;
            }

            const splitHostDetails = hostDetails.split(":");

            const protocol = splitHostDetails[0].toLowerCase();
            if (!["http", "https"].includes(protocol)) {
                return;
            }

            let host = splitHostDetails[1];
            if (host.slice(0, 2) !== "//") {
                return;
            }
            host = host.slice(2);

            const port = parseInt(splitHostDetails[2]);
            if (!port || isNaN(port)) {
                return;
            }

            const username = await window.showInputBox({
                title: "Input Username",
                placeHolder: "e.g. user123",
                ignoreFocusOut: true
            });
            if (!username) {
                return;
            }

            const userPassword = await window.showInputBox({
                title: "Input Password",
                placeHolder: "e.g. 12345678",
                password: true,
                ignoreFocusOut: true
            });
            if (!userPassword) {
                return;
            }

            const plexName = await window.showInputBox({
                title: "Input Plex Name",
                placeHolder: "e.g. PLEX123",
                ignoreFocusOut: true
            });

            let regionName = await window.showInputBox({
                title: "Input Region Name",
                placeHolder: "e.g. REGION123",
                ignoreFocusOut: true
            });


            const rejectUnauthorized = await window.showQuickPick(["True", "False"], {
                title: "Reject Unauthorized",
                ignoreFocusOut: true
            });
            if (!rejectUnauthorized) {
                return;
            }
            const message = {
                profile: {
                    name: connnectionName,
                    host: host,
                    port: port,
                    user: username,
                    password: userPassword,
                    rejectUnauthorized: rejectUnauthorized === "True" ? true : false,
                    protocol: protocol,
                    cicsPlex: plexName!.length === 0 ? undefined : plexName,
                    regionName: regionName!.length === 0 ? undefined : regionName,
                },
                name: connnectionName,
                type: "CICS",
                overwrite: true,
            };

            try {
                await ProfileManagement.createNewProfile(message);
                await this.loadProfile(ProfileManagement.getProfilesCache().loadNamedProfile(message.name, 'cics'));
            } catch (error) {
                // @ts-ignore
                window.showErrorMessage(error);
            }
        } else {
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
                    const allCICSProfileNames = await ProfileManagement.getProfilesCache().getNamesForType('cics');
                    if (allCICSProfileNames.includes(message.name)) {
                        window.showErrorMessage(`Profile "${message.name}" already exists`);
                        return;
                    }
                    await ProfileManagement.createNewProfile(message);
                    await this.loadProfile(ProfileManagement.getProfilesCache().loadNamedProfile(message.name, 'cics'));
                } catch (error) {
                    // @ts-ignore
                    window.showErrorMessage(error);
                }
            });

        }


    }

    async removeSession(session: CICSSessionTree, profile?: IProfileLoaded, position?: number) {
        const persistentStorage = new PersistentStorage("Zowe.CICS.Persistent");
        await persistentStorage.removeLoadedCICSProfile(session.label!.toString());

        this.loadedProfiles = this.loadedProfiles.filter(profile => profile !== session);
        if (profile && position !== undefined) {
            await this.loadProfile(profile!, position);
        }
        this._onDidChangeTreeData.fire(undefined);
    }

    async deleteSession(sessions: CICSSessionTree[]) {
        let answer;
        if (sessions.length === 1) {
            answer = await window.showInformationMessage(
                `Are you sure you want to delete the profile "${sessions[0].label?.toString()!}"`,
                ...["Yes", "No"]);
        } else if (sessions.length > 1) {
            answer = await window.showInformationMessage(
                `Are you sure you want to delete the profiles "${sessions.map((sessionTree) => {
                    return sessionTree.label?.toString()!;
                })}"`,
                ...["Yes", "No"]);
        }
        if (answer === "Yes") {
            window.withProgress({
                title: 'Delete Profile',
                location: ProgressLocation.Notification,
                cancellable: true
            }, async (progress, token) => {
                token.onCancellationRequested(() => {
                    console.log("Cancelling the delete command");
                });
                for (const index in sessions) {
                    progress.report({
                        message: `Deleting profile ${parseInt(index) + 1} of ${sessions.length}`,
                        increment: (parseInt(index) / sessions.length) * 100,
                    });
                    try {
                        await ProfileManagement.deleteProfile({
                            name: sessions[parseInt(index)].label?.toString()!,
                            rejectIfDependency: true
                        });
                        const persistentStorage = new PersistentStorage("Zowe.CICS.Persistent");
                        await persistentStorage.removeLoadedCICSProfile(sessions[parseInt(index)].label!.toString());

                        this.loadedProfiles = this.loadedProfiles.filter(profile => profile !== sessions[parseInt(index)]);
                        this._onDidChangeTreeData.fire(undefined);
                    } catch (error) {
                        // @ts-ignore
                        window.showErrorMessage(error);
                    }
                }

            }
            );


        }

    }

    async updateSession(session: CICSSessionTree) {
        const profileToUpdate = await ProfileManagement.getProfilesCache().loadNamedProfile(session.label?.toString()!, 'cics');

        const message = {
            name: profileToUpdate.name,
            profile: {
                name: profileToUpdate.name,
                ...profileToUpdate.profile
            }
        };
        await this.updateSessionHelper(session, message);
    }

    async updateSessionHelper(session: CICSSessionTree, messageToUpdate?: IUpdateProfile) {
        const column = window.activeTextEditor
            ? window.activeTextEditor.viewColumn
            : undefined;
        const panel: WebviewPanel = window.createWebviewPanel(
            "zowe",
            `Update CICS Profile`,
            column || 1,
            { enableScripts: true }
        );
        panel.webview.html = addProfileHtml(messageToUpdate);
        panel.webview.onDidReceiveMessage(async (message) => {
            try {
                panel.dispose();
                const profile = await ProfileManagement.updateProfile(message);
                const position = this.loadedProfiles.indexOf(session);
                const updatedProfile = await ProfileManagement.getProfilesCache().loadNamedProfile(profile.profile!.name, 'cics');
                await this.removeSession(session, updatedProfile, position);

            } catch (error) {
                // @ts-ignore
                window.showErrorMessage(error);
            }
        });


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