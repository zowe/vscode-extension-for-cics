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
import { imperative } from "@zowe/zowe-explorer-api";
import { Event, EventEmitter, ProgressLocation, ProviderResult, TreeDataProvider, TreeItem, WebviewPanel, commands, window } from "vscode";
import { PersistentStorage } from "../utils/PersistentStorage";
import { InfoLoaded, ProfileManagement } from "../utils/profileManagement";
import { isTheia, openConfigFile } from "../utils/workspaceUtils";
import { addProfileHtml } from "../utils/webviewHTML";
import { CICSPlexTree } from "./CICSPlexTree";
import { CICSRegionTree } from "./CICSRegionTree";
import { CICSSessionTree } from "./CICSSessionTree";
import * as https from "https";
import { getIconPathInResources, missingSessionParameters, promptCredentials } from "../utils/profileUtils";

export class CICSTree
    implements TreeDataProvider<CICSSessionTree>{

    loadedProfiles: CICSSessionTree[] = [];
    constructor() {
        this.loadStoredProfileNames();
    }
    public getLoadedProfiles() {
        return this.loadedProfiles;
    }

    public async refreshLoadedProfiles() {
        this.clearLoadedProfiles();
        await this.loadStoredProfileNames();
        commands.executeCommand('workbench.actions.treeView.cics-view.collapseAll');
    }

    public clearLoadedProfiles() {
        this.loadedProfiles = [];
        this._onDidChangeTreeData.fire(undefined);
    }

    /**
     * Searches profiles stored in persistent storage, retrieves information for that profile from
     * ZE's PorfilesCache API and then creates CICSSessionTrees with this information and adds
     * these as children to the CICSTree (TreeDataProvider)
     */
    public async loadStoredProfileNames() {
        const persistentStorage = new PersistentStorage("zowe.cics.persistent");
        await ProfileManagement.profilesCacheRefresh();
        // Retrieve previously added profiles from persistent storage
        for (const profilename of persistentStorage.getLoadedCICSProfile()) {
            try {
                const profileToLoad = await ProfileManagement.getProfilesCache().loadNamedProfile(profilename, 'cics');
                // avoid accidental repeats
                if (!this.loadedProfiles.filter(sessionTree => sessionTree.label === profilename).length) {
                    const newSessionTree = new CICSSessionTree(profileToLoad);
                    this.loadedProfiles.push(newSessionTree);
                }
            } catch {
                continue;
            }
        }
        this._onDidChangeTreeData.fire(undefined);
    }

    /**
     *
     * Provides user with prompts and allows them to add a profile after clicking the '+' button
     */
    async addProfile() {
        try {
        //const allCICSProfileNames = await ProfileManagement.getProfilesCache().getNamesForType('cics');
        const configInstance = await ProfileManagement.getConfigInstance();
        const allCICSProfiles = (await ProfileManagement.getProfilesCache().getProfileInfo()).getAllProfiles("cics");
        // const allCICSProfiles = await ProfileManagement.getProfilesCache().getProfiles('cics');
        if (!allCICSProfiles) {
            if (!configInstance.usingTeamConfig) {
                window.showErrorMessage(`Could not find any CICS profiles`);
                return;
            }
            window.showInformationMessage(`Could not find any CICS profiles`);
        }
        const allCICSProfileNames: string[] = allCICSProfiles ? allCICSProfiles.map((profile) => profile.profName) as unknown as [string] : [];
        // No cics profiles needed beforhand for team config method
        if (configInstance.usingTeamConfig || allCICSProfileNames.length > 0) {
            const profileNameToLoad = await window.showQuickPick(
                [{ label: "\uFF0B Create New CICS Profile..." }].concat(allCICSProfileNames.filter((name) => {
                    for (const loadedProfile of this.loadedProfiles) {
                        if (loadedProfile.label === name) {
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
                // If Create New CICS Profile option chosen
                if (profileNameToLoad.label.includes("\uFF0B")) {
                    if (configInstance.usingTeamConfig) {
                        // get all profiles of all types including zosmf
                        const profiles = configInstance.getAllProfiles();
                        if (!profiles.length) {
                            window.showErrorMessage("No profiles found in config file. Create a new config file or add a profile to get started");
                        }
                        const currentProfile = await ProfileManagement.getProfilesCache().getProfileFromConfig(profiles[0].profName);
                        const filePath = currentProfile?.profLoc.osLoc?.[0] ?? "";
                        if (filePath !== "") {
                            await openConfigFile(filePath);
                        }
                    } else {
                        await this.createNewProfile();
                    }
                } else {
                    let profileToLoad;
                    // TODO: Just use loadNamedProfile once the method is configured to v2 profiles
                    if (configInstance.usingTeamConfig){
                        profileToLoad = await ProfileManagement.getProfilesCache().getLoadedProfConfig(profileNameToLoad.label); //ProfileManagement.getProfilesCache().loadNamedProfile(profileNameToLoad.label, 'cics');
                    } else {
                        await ProfileManagement.profilesCacheRefresh();
                        profileToLoad = ProfileManagement.getProfilesCache().loadNamedProfile(profileNameToLoad.label, 'cics');
                    }
                    const newSessionTree = new CICSSessionTree(profileToLoad);
                    this.loadedProfiles.push(newSessionTree);
                    const persistentStorage = new PersistentStorage("zowe.cics.persistent");
                    await persistentStorage.addLoadedCICSProfile(profileNameToLoad.label);
                    this._onDidChangeTreeData.fire(undefined);
                }
            }
        } else {
            window.showInformationMessage(
                "No Profiles Found... Opening Profile Creation Form"
            );
            //  Create New Profile Form should appear
            this.createNewProfile();

        }
    } catch(error) {
        console.log(error);
        window.showErrorMessage(JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(/(\\n\t|\\n|\\t)/gm," "));
    }

    }

    /**
     *
     * @param profile
     * @param position number that's passed in when updating or expanding profile - needed
     * to replace position of current CICSSessionTree.
     * @param sessionTree current CICSSessionTree only passed in if expanding a profile
     */
    async loadProfile(profile: imperative.IProfileLoaded, position?: number | undefined, sessionTree?: CICSSessionTree) {
        const persistentStorage = new PersistentStorage("zowe.cics.persistent");
        await persistentStorage.addLoadedCICSProfile(profile.name!);
        let newSessionTree : CICSSessionTree;
        window.withProgress({
            title: 'Load profile',
            location: ProgressLocation.Notification,
            cancellable: true
          }, async (progress, token) => {
            token.onCancellationRequested(() => {
              console.log(`Cancelling the loading of ${profile.name}`);
            });

            progress.report({
            message: `Loading ${profile.name}`
            });
            try {
                const configInstance = await ProfileManagement.getConfigInstance();
                if (configInstance.usingTeamConfig){
                    let missingParamters = missingSessionParameters(profile.profile);
                    if (missingParamters.length) {
                        const userPass = ["user", "password"];
                        if (missingParamters.includes(userPass[0]) || missingParamters.includes(userPass[1])){
                            const updatedProfile = await promptCredentials(profile.name!, true);
                            if (!updatedProfile) {
                                return;
                            }
                            profile = updatedProfile;
                            // Remove "user" and "password" from missing params array
                            missingParamters = missingParamters.filter(param => (userPass.indexOf(param!) === -1) || (userPass.indexOf(param!) === -1));
                        }
                        if (missingParamters.length) {
                            window.showInformationMessage(`The following fields are missing from ${profile.name}: ${missingParamters.join(", ")}. Please update them in your config file.`);
                            return;
                        }
                    // If profile is expanded and it previously had 401 error code
                    } else if (sessionTree && sessionTree.getIsUnauthorized()) {
                        const updatedProfile = await promptCredentials(profile.name!, true);
                        if (!updatedProfile) {
                            return;
                        }
                        profile = updatedProfile;
                    }
                }
                const plexInfo: InfoLoaded[] = await ProfileManagement.getPlexInfo(profile);
                // Initialise session tree
                newSessionTree = new CICSSessionTree(profile, getIconPathInResources("profile-dark.svg", "profile-light.svg"));
                // For each InfoLoaded object - happens if there are multiple plexes
                for (const item of plexInfo) {
                    // No plex
                    if (item.plexname === null) {
                        const session = new imperative.Session({
                            type: "basic",
                            hostname: profile.profile!.host,
                            port: Number(profile.profile!.port),
                            user: profile.profile!.user,
                            password: profile.profile!.password,
                            rejectUnauthorized: profile.profile!.rejectUnauthorized,
                            protocol: profile.profile!.protocol,
                        });
                        try {

                            https.globalAgent.options.rejectUnauthorized = profile!.profile!.rejectUnauthorized;

                            const regionsObtained = await getResource(session, {
                                name: "CICSRegion",
                                regionName: item.regions[0].applid
                            });
                            // 200 OK received
                            newSessionTree.setAuthorized();
                            https.globalAgent.options.rejectUnauthorized = undefined;
                            const newRegionTree = new CICSRegionTree(
                                item.regions[0].applid,
                                regionsObtained.response.records.cicsregion,
                                newSessionTree,
                                undefined,
                                newSessionTree
                                );
                            newSessionTree.addRegion(newRegionTree);
                        } catch (error) {
                            https.globalAgent.options.rejectUnauthorized = undefined;
                            console.log(error);
                        }
                    } else {
                        if (item.group) {
                            const newPlexTree = new CICSPlexTree(item.plexname, profile, newSessionTree, profile!.profile!.regionName);
                            newPlexTree.setLabel(`${item.plexname} - ${profile!.profile!.regionName}`);
                            newSessionTree.addPlex(newPlexTree);
                        } else {
                            //Plex
                            const newPlexTree = new CICSPlexTree(item.plexname, profile, newSessionTree);
                            newSessionTree.addPlex(newPlexTree);
                        }
                    }
                }
                // If method was called when expanding profile
                if (sessionTree) {
                    this.loadedProfiles.splice(position!, 1, newSessionTree);
                }
                // If method was called when updating profile
                else if (position || position === 0) {
                    this.loadedProfiles.splice(position, 0, newSessionTree);
                } else {
                    this.loadedProfiles.push(newSessionTree);
                }
                this._onDidChangeTreeData.fire(undefined);
            } catch (error) {
                https.globalAgent.options.rejectUnauthorized = undefined;
                // Change session tree icon to disconnected upon error
                newSessionTree = new CICSSessionTree(
                    profile,
                    getIconPathInResources("profile-disconnected-dark.svg", "profile-disconnected-light.svg")
                    );
                // If method was called when expanding profile
                if (sessionTree) {
                    this.loadedProfiles.splice(position!, 1, newSessionTree);
                }
                // If method was called when updating profile
                else if (position || position === 0) {
                    this.loadedProfiles.splice(position, 0, newSessionTree);
                } else {
                    this.loadedProfiles.push(newSessionTree);
                }
                this._onDidChangeTreeData.fire(undefined);

                if (typeof(error) === 'object') {
                    if ("code" in error!){
                        switch((error as any).code) {
                            case 'ETIMEDOUT':
                                window.showErrorMessage(`Error: connect ETIMEDOUT ${profile!.profile!.host}:${profile!.profile!.port} (${profile.name})`);
                                break;
                            case "ENOTFOUND":
                                window.showErrorMessage(`Error: getaddrinfo ENOTFOUND ${profile!.profile!.host}:${profile!.profile!.port} (${profile.name})`);
                                break;
                            case "ECONNRESET":
                                window.showErrorMessage(`Error: socket hang up ${profile!.profile!.host}:${profile!.profile!.port} (${profile.name})`);
                                break;
                            case "EPROTO":
                                window.showErrorMessage(`Error: write EPROTO ${profile!.profile!.host}:${profile!.profile!.port} (${profile.name})`);
                                break;
                            case "DEPTH_ZERO_SELF_SIGNED_CERT":
                            case "SELF_SIGNED_CERT_IN_CHAIN":
                            case "ERR_TLS_CERT_ALTNAME_INVALID":
                            case "CERT_HAS_EXPIRED":
                                // If re-expanding a profile that has an expired certificate
                                if (sessionTree){
                                    const decision = await window.showInformationMessage(
                                        `Warning: Your connection is not private (${(error as any).code}) - would you still like to proceed to ${profile!.profile!.host} (unsafe)?`,
                                        ...["Yes", "No"]);
                                    if (decision) {
                                        if (decision === "Yes") {
                                            const configInstance = await ProfileManagement.getConfigInstance();
                                            let updatedProfile;
                                            if (configInstance.usingTeamConfig) {
                                                const upd = { profileName: profile.name!, profileType: 'cics' };
                                                const configInstance = await ProfileManagement.getConfigInstance();
                                                // flip rejectUnauthorized to false
                                                await configInstance.updateProperty({ ...upd, property: "rejectUnauthorized", value: false });
                                                updatedProfile = await ProfileManagement.getProfilesCache().getLoadedProfConfig(profile.name!);
                                            } else {
                                                // flip rejectUnauthorized to false
                                                const message = {
                                                    name: profile.name,
                                                    profile: {
                                                        ...profile.profile,
                                                        rejectUnauthorized: false
                                                    }
                                                };
                                                const newProfile = await ProfileManagement.updateProfile(message);
                                                await ProfileManagement.profilesCacheRefresh();
                                                updatedProfile = await ProfileManagement.getProfilesCache().loadNamedProfile(profile.name!, 'cics');
                                            }
                                            await this.removeSession(sessionTree, updatedProfile, position);
                                        }

                                    }
                                }
                                break;
                            default:
                                window.showErrorMessage(`Error: An error has occurred ${profile!.profile!.host}:${profile!.profile!.port} (${profile.name}) - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(/(\\n\t|\\n|\\t)/gm," ")}`);
                        }

                    } else if ("response" in error!) {
                        if ((error as any).response !== 'undefined' && (error as any).response.status){
                            switch((error as any).response.status) {
                                case 401:
                                    window.showErrorMessage(`Error: Request failed with status code 401 for Profile '${profile.name}'`);
                                    // set the unauthorized flag to true for reprompting of credentials.
                                    newSessionTree.setUnauthorized();
                                    // Replace old profile tree with new disconnected profile tree item
                                    this.loadedProfiles.splice(position!, 1, newSessionTree);
                                    break;
                                case 404:
                                    window.showErrorMessage(`Error: Request failed with status code 404 for Profile '${profile.name}' - Not Found`);
                                    break;
                                case 500:
                                    window.showErrorMessage(`Error: Request failed with status code 500 for Profile '${profile.name}'`);
                                    break;
                                default:
                                    window.showErrorMessage(`Error: Request failed with status code ${(error as any).response.status} for Profile '${profile.name}'`);
                            }
                        } else {
                            window.showErrorMessage(`Error: An error has occurred ${profile!.profile!.host}:${profile!.profile!.port} (${profile.name}) - ${JSON.stringify(error, Object.getOwnPropertyNames(error)).replace(/(\\n\t|\\n|\\t)/gm," ")}`);
                        }
                    }
                }
                console.log(error);
            }
            }
        );
    }

    /**
     * Method for V1 profile configuration that provides UI for user to enter profile details
     * and creates a profile.
     */
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
                await ProfileManagement.profilesCacheRefresh();
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
                    const allCICSProfileNames = (await ProfileManagement.getProfilesCache().getProfileInfo()).getAllProfiles("cics").map((profile) => profile.profName);//await ProfileManagement.getProfilesCache().getNamesForType('cics');
                    if (allCICSProfileNames.includes(message.name)) {
                        window.showErrorMessage(`Profile "${message.name}" already exists`);
                        return;
                    }
                    await ProfileManagement.createNewProfile(message);
                    await ProfileManagement.profilesCacheRefresh();
                    await this.loadProfile(ProfileManagement.getProfilesCache().loadNamedProfile(message.name, 'cics'));
                } catch (error) {
                    console.log(error);
                    // @ts-ignore
                    window.showErrorMessage(error);
                }
            });

        }


    }

    async removeSession(session: CICSSessionTree, profile?: imperative.IProfileLoaded, position?: number) {
        const persistentStorage = new PersistentStorage("zowe.cics.persistent");
        await persistentStorage.removeLoadedCICSProfile(session.label!.toString());
        this.loadedProfiles = this.loadedProfiles.filter(profile => profile.profile.name !== session.label?.toString());
        if (profile && position !== undefined) {
            await this.loadProfile(profile!, position);
        }
        this._onDidChangeTreeData.fire(undefined);
    }

    /**
     * Delete profile functionality for V1 profile configuration
     * @param sessions
     */
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
                        const persistentStorage = new PersistentStorage("zowe.cics.persistent");
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
        await ProfileManagement.profilesCacheRefresh();
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

    async updateSessionHelper(session: CICSSessionTree, messageToUpdate?: imperative.IUpdateProfile) {
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
                await ProfileManagement.profilesCacheRefresh();
                const updatedProfile = await ProfileManagement.getProfilesCache().loadNamedProfile(profile?.profile!.name, 'cics');
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

    getParent(element: any): ProviderResult<any> {
        element.getParent();
    }

    public _onDidChangeTreeData: EventEmitter<any | undefined> = new EventEmitter<
        any | undefined
    >();
    readonly onDidChangeTreeData: Event<any | undefined> =
        this._onDidChangeTreeData.event;
}