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
import { Event, EventEmitter, ProviderResult, TreeDataProvider, TreeItem, window } from "vscode";
import { ProfileManagement } from "../utils/profileManagement";
import { CICSLocalFileTree } from "./CICSLocalFileTree";
import { CICSPlexTree } from "./CICSPlexTree";
import { CICSProgramTree } from "./CICSProgramTree";
import { CICSRegionTree } from "./CICSRegionTree";
import { CICSSessionTree } from "./CICSSessionTree";
import { CICSTransactionTree } from "./CICSTransactionTree";
import { CICSLocalFileTreeItem } from "./treeItems/CICSLocalFileTreeItem";
import { CICSProgramTreeItem } from "./treeItems/CICSProgramTreeItem";
import { CICSTransactionTreeItem } from "./treeItems/CICSTransactionTreeItem";

export class CICSTree
    implements TreeDataProvider<CICSSessionTree>{

    loadedProfiles: CICSSessionTree[] = [];
    constructor() {
        this.loadDefaultProfile();
    }

    public async loadDefaultProfile() {
        const defaultCicsProfile = ProfileManagement.getProfilesCache().getDefaultProfile('cics');
        if (defaultCicsProfile) {
            await this.loadProfile(defaultCicsProfile);
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
        }

    }

    async loadProfile(profile: IProfileLoaded) {

        const plexInfo = await ProfileManagement.getPlexInfo(profile);
        const newSessionTree = new CICSSessionTree(profile);
        for (const item of plexInfo) {
            if (item.plexname === null) {
                const newProgramTree = new CICSProgramTree();
                const newTransactionTree = new CICSTransactionTree();
                const newLocalFileTree = new CICSLocalFileTree();

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

                const newRegionTree = new CICSRegionTree(item.regions[0].applid, regionsObtained.response.records.cicsregion, newSessionTree, undefined, newProgramTree, newTransactionTree, newLocalFileTree);
                newSessionTree.addRegion(newRegionTree);
            } else {
                const newPlexTree = new CICSPlexTree(item.plexname);
                for (const regionInPlex of item.regions) {
                    const newProgramTree = new CICSProgramTree();
                    const newTransactionTree = new CICSTransactionTree();
                    const newLocalFileTree = new CICSLocalFileTree();
                    const newRegionTree = new CICSRegionTree(regionInPlex.cicsname, regionInPlex, newSessionTree, newPlexTree, newProgramTree, newTransactionTree, newLocalFileTree);
                    newPlexTree.addRegion(newRegionTree);
                }
                newSessionTree.addPlex(newPlexTree);
            }
        }
        this.loadedProfiles.push(newSessionTree);
        this._onDidChangeTreeData.fire(undefined);

    }

    async loadRegionContents(regionTree: CICSRegionTree) {
        try {
            const programResponse = await getResource(regionTree.parentSession.session, {
                name: "CICSProgram",
                regionName: regionTree.getRegionName(),
                cicsPlex: regionTree.parentPlex ? regionTree.parentPlex!.getPlexName() : undefined,
                criteria:
                    "NOT (PROGRAM=CEE* OR PROGRAM=DFH* OR PROGRAM=CJ* OR PROGRAM=EYU* OR PROGRAM=CSQ* OR PROGRAM=CEL* OR PROGRAM=IGZ*)"
            });
            const programTree = regionTree.children.filter(child => child.contextValue!.includes("cicstreeprogram"))[0];
            programTree.children = [];
            for (const program of programResponse.response.records.cicsprogram) {
                const newProgramItem = new CICSProgramTreeItem(program, regionTree);
                //@ts-ignore
                programTree.addProgram(newProgramItem);
            }
            this._onDidChangeTreeData.fire(undefined);
        } catch (error) {
            console.log(error);
        }

        try {
            const transactionResponse = await getResource(regionTree.parentSession.session, {
                name: "CICSLocalTransaction",
                regionName: regionTree.getRegionName(),
                cicsPlex: regionTree.parentPlex ? regionTree.parentPlex!.getPlexName() : undefined,
            });
            const transactionTree = regionTree.children.filter(child => child.contextValue!.includes("cicstransactiontree"))[0];
            transactionTree.children = [];

            for (const transaction of transactionResponse.response.records.cicslocaltransaction) {
                const newTransactionItem = new CICSTransactionTreeItem(transaction, regionTree);
                //@ts-ignore
                transactionTree.addTransaction(newTransactionItem);
            }
            this._onDidChangeTreeData.fire(undefined);
        } catch (error) {
            console.log(error);
        }

        try {
            const localFileResponse = await getResource(regionTree.parentSession.session, {
                name: "CICSLocalFile",
                regionName: regionTree.getRegionName(),
                cicsPlex: regionTree.parentPlex ? regionTree.parentPlex!.getPlexName() : undefined,
            });
            const localFileTree = regionTree.children.filter(child => child.contextValue!.includes("cicslocalfiletree"))[0];
            localFileTree.children = [];

            for (const localFile of localFileResponse.response.records.cicslocalfile) {
                const newLocalFileItem = new CICSLocalFileTreeItem(localFile, regionTree);
                //@ts-ignore
                localFileTree.addLocalFile(newLocalFileItem);
            }
            this._onDidChangeTreeData.fire(undefined);
        } catch (error) {
            console.log(error);
        }
    }

    removeSession(session: CICSSessionTree) {
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