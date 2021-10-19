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
    private static readonly regionSearchHistory: string = "regionSearchHistory";
    private static readonly loadedCICSProfile: string = "loadedCICSProfile";


    private mProgramSearchHistory: string[] = [];
    private mTransactionSearchHistory: string[] = [];
    private mLocalFileSearchHistory: string[] = [];
    private mRegionSearchHistory: string[] = [];
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
        let regionSearchHistoryLines: string[] | undefined;
        let loadedCICSProfileLines: string[] | undefined;

        if (workspace.getConfiguration(this.schema)) {
            programSearchHistoryLines = workspace.getConfiguration(this.schema).get(PersistentStorage.programSearchHistory);
            transactionSearchHistoryLines = workspace.getConfiguration(this.schema).get(PersistentStorage.transactionSearchHistory);
            localFileSearchHistoryLines = workspace.getConfiguration(this.schema).get(PersistentStorage.localFileSearchHistory);
            regionSearchHistoryLines = workspace.getConfiguration(this.schema).get(PersistentStorage.regionSearchHistory);
            loadedCICSProfileLines = workspace.getConfiguration(this.schema).get(PersistentStorage.loadedCICSProfile);
        }
        if (programSearchHistoryLines) {
            this.mProgramSearchHistory = programSearchHistoryLines;
        } else {
            await this.resetProgramSearchHistory();
        }
        if (transactionSearchHistoryLines) {
            this.mTransactionSearchHistory = transactionSearchHistoryLines;
        } else {
            await this.resetTransactionSearchHistory();
        }
        if (localFileSearchHistoryLines) {
            this.mLocalFileSearchHistory = localFileSearchHistoryLines;
        } else {
            await this.resetLocalFileSearchHistory();
        }
        if (regionSearchHistoryLines) {
            this.mRegionSearchHistory = regionSearchHistoryLines;
        } else {
            await this.resetRegionSearchHistory();
        }
        if (loadedCICSProfileLines) {
            this.mLoadedCICSProfile = loadedCICSProfileLines;
        } else {
            await this.resetLoadedCICSProfile();
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
    public getRegionSearchHistory(): string[] {
        return this.mRegionSearchHistory;
    }
    public getLoadedCICSProfile(): string[] {
        return this.mLoadedCICSProfile;
    }



    public async resetProgramSearchHistory() {
        this.mProgramSearchHistory = [];
        await this.updateProgramSearchHistory();
    }
    public async resetTransactionSearchHistory() {
        this.mTransactionSearchHistory = [];
        await this.updateTransactionSearchHistory();
    }
    public async resetLocalFileSearchHistory() {
        this.mLocalFileSearchHistory = [];
        await this.updateLocalFileSearchHistory();
    }
    public async resetRegionSearchHistory() {
        this.mRegionSearchHistory = [];
        await this.updateRegionSearchHistory();
    }
    public async resetLoadedCICSProfile(){
        this.mLoadedCICSProfile = [];
        await this.updateLoadedCICSProfile();
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
    private async updateRegionSearchHistory() {
        const settings: any = { ...workspace.getConfiguration(this.schema) };
        if (settings.persistence) {
            settings[PersistentStorage.regionSearchHistory] = this.mRegionSearchHistory;
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
            await this.updateProgramSearchHistory();
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
            await this.updateTransactionSearchHistory();
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
            await this.updateLocalFileSearchHistory();
        }
    }
    public async addRegionSearchHistory(criteria: string) {
        if (criteria) {
            this.mRegionSearchHistory = this.mRegionSearchHistory.filter((element) => {
                return element.trim() !== criteria.trim();
            });

            this.mRegionSearchHistory.unshift(criteria);

            if (this.mRegionSearchHistory.length > 10) {
                this.mRegionSearchHistory.pop();
            }
            await this.updateRegionSearchHistory();
        }
    }

    public async addLoadedCICSProfile(name: string) {
        if (name) {
            this.mLoadedCICSProfile = this.mLoadedCICSProfile.filter((element) => {
                return element.trim() !== name.trim();
            });

            this.mLoadedCICSProfile.unshift(name);
            await this.updateLoadedCICSProfile();
        }
    }

    public async removeLoadedCICSProfile(name: string){
        if (name) {
            this.mLoadedCICSProfile = this.mLoadedCICSProfile.filter((element) => {
                return element.trim() !== name.trim();
            });

            await this.updateLoadedCICSProfile();
        }
    }

}