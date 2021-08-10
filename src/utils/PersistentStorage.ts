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

import { ConfigurationTarget, workspace } from 'vscode';

export class PersistentStorage {
    public schema: string;
    private static readonly programSearchHistory: string = "programSearchHistory";
    private static readonly transactionSearchHistory: string = "transactionSearchHistory";
    private static readonly localFileSearchHistory: string = "localFileSearchHistory";
    private static readonly loadedCICSProfile: string = "loadedCICSProfile";


    private mProgramSearchHistory: string[] = [];
    private mTransactionSearchHistory: string[] = [];
    private mLocalFileSearchHistory: string[] = [];
    private mLoadedCICSProfile: string[] = [];

    constructor(
        schema: string,
    ) {
        this.schema = schema;
        this.init();
    }

    private async init() {
        let programSearchHistoryLines: string[] | undefined;
        let transactionSearchHistoryLines: string[] | undefined;
        let localFileSearchHistoryLines: string[] | undefined;
        let loadedCICSProfileLines: string[] | undefined;

        if (workspace.getConfiguration(this.schema)) {
            programSearchHistoryLines = workspace.getConfiguration(this.schema).get(PersistentStorage.programSearchHistory);
            transactionSearchHistoryLines = workspace.getConfiguration(this.schema).get(PersistentStorage.transactionSearchHistory);
            localFileSearchHistoryLines = workspace.getConfiguration(this.schema).get(PersistentStorage.localFileSearchHistory);
            loadedCICSProfileLines = workspace.getConfiguration(this.schema).get(PersistentStorage.loadedCICSProfile);
        }
        if (programSearchHistoryLines) {
            this.mProgramSearchHistory = programSearchHistoryLines;
        } else {
            this.resetProgramSearchHistory();
        }
        if (transactionSearchHistoryLines) {
            this.mTransactionSearchHistory = transactionSearchHistoryLines;
        } else {
            this.resetTransactionSearchHistory();
        }
        if (localFileSearchHistoryLines) {
            this.mLocalFileSearchHistory = localFileSearchHistoryLines;
        } else {
            this.resetLocalFileSearchHistory();
        }
        if (loadedCICSProfileLines) {
            this.mLoadedCICSProfile = loadedCICSProfileLines;
        } else {
            this.resetLoadedCICSProfile();
        }
    }



    public getProgramSearchHistory(): string[] {
        return this.mProgramSearchHistory;
    }
    public getTransactionSearchHistory(): string[] {
        return this.mTransactionSearchHistory;
    }
    public getLocalFileSearchHistory(): string[] {
        return this.mLocalFileSearchHistory;
    }
    public getLoadedCICSProfile(): string[] {
        return this.mLoadedCICSProfile;
    }



    public async resetProgramSearchHistory() {
        this.mProgramSearchHistory = [];
        this.updateProgramSearchHistory();
    }
    public async resetTransactionSearchHistory() {
        this.mTransactionSearchHistory = [];
        this.updateTransactionSearchHistory();
    }
    public async resetLocalFileSearchHistory() {
        this.mLocalFileSearchHistory = [];
        this.updateLocalFileSearchHistory();
    }
    public async resetLoadedCICSProfile(){
        this.mLoadedCICSProfile = [];
        this.updateLoadedCICSProfile();
    }



    private async updateProgramSearchHistory() {
        const settings: any = { ...workspace.getConfiguration(this.schema) };
        if (settings.persistence) {
            settings[PersistentStorage.programSearchHistory] = this.mProgramSearchHistory;
            await workspace.getConfiguration().update(this.schema, settings, ConfigurationTarget.Global);
        }
    }
    private async updateTransactionSearchHistory() {
        const settings: any = { ...workspace.getConfiguration(this.schema) };
        if (settings.persistence) {
            settings[PersistentStorage.transactionSearchHistory] = this.mTransactionSearchHistory;
            await workspace.getConfiguration().update(this.schema, settings, ConfigurationTarget.Global);
        }
    }
    private async updateLocalFileSearchHistory() {
        const settings: any = { ...workspace.getConfiguration(this.schema) };
        if (settings.persistence) {
            settings[PersistentStorage.localFileSearchHistory] = this.mLocalFileSearchHistory;
            await workspace.getConfiguration().update(this.schema, settings, ConfigurationTarget.Global);
        }
    }
    private async updateLoadedCICSProfile(){
        const settings: any = { ...workspace.getConfiguration(this.schema) };
        if (settings.persistence) {
            settings[PersistentStorage.loadedCICSProfile] = this.mLoadedCICSProfile;
            await workspace.getConfiguration().update(this.schema, settings, ConfigurationTarget.Global);
        }
    }



    public async addProgramSearchHistory(criteria: string) {
        if (criteria) {
            this.mProgramSearchHistory = this.mProgramSearchHistory.filter((element) => {
                return element.trim() !== criteria.trim();
            });

            this.mProgramSearchHistory.unshift(criteria);

            if (this.mProgramSearchHistory.length > 10) {
                this.mProgramSearchHistory.pop();
            }
            this.updateProgramSearchHistory();
        }
    }
    public async addTransactionSearchHistory(criteria: string) {
        if (criteria) {
            this.mTransactionSearchHistory = this.mTransactionSearchHistory.filter((element) => {
                return element.trim() !== criteria.trim();
            });

            this.mTransactionSearchHistory.unshift(criteria);

            if (this.mTransactionSearchHistory.length > 10) {
                this.mTransactionSearchHistory.pop();
            }
            this.updateTransactionSearchHistory();
        }
    }
    public async addLocalFileSearchHistory(criteria: string) {
        if (criteria) {
            this.mLocalFileSearchHistory = this.mLocalFileSearchHistory.filter((element) => {
                return element.trim() !== criteria.trim();
            });

            this.mLocalFileSearchHistory.unshift(criteria);

            if (this.mLocalFileSearchHistory.length > 10) {
                this.mLocalFileSearchHistory.pop();
            }
            this.updateLocalFileSearchHistory();
        }
    }

    public async addLoadedCICSProfile(name: string) {
        if (name) {
            this.mLoadedCICSProfile = this.mLoadedCICSProfile.filter((element) => {
                return element.trim() !== name.trim();
            });

            this.mLoadedCICSProfile.unshift(name);
            this.updateLoadedCICSProfile();
        }
    }

    public async removeLoadedCICSProfile(name: string){
        if (name) {
            this.mLoadedCICSProfile = this.mLoadedCICSProfile.filter((element) => {
                return element.trim() !== name.trim();
            });

            this.updateLoadedCICSProfile();
        }
    }

}