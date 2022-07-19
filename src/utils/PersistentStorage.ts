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
    private static readonly librarySearchHistory: string = "librarySearchHistory";
    private static readonly transactionSearchHistory: string = "transactionSearchHistory";
    private static readonly db2TransactionSearchHistory: string = "db2TransactionSearchHistory";
    private static readonly localFileSearchHistory: string = "localFileSearchHistory";
    private static readonly regionSearchHistory: string = "regionSearchHistory";
    private static readonly loadedCICSProfile: string = "loadedCICSProfile";


    private mProgramSearchHistory: string[] = [];
    private mLibrarySearchHistory: string[] = [];
    private mTransactionSearchHistory: string[] = [];
    private mDb2TransactionSearchHistory: string[] = [];
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
        let librarySearchHistoryLines: string[] | undefined;  
        let transactionSearchHistoryLines: string[] | undefined;
        let db2TransactionSearchHistoryLines: string[] | undefined;
        let localFileSearchHistoryLines: string[] | undefined;
        let regionSearchHistoryLines: string[] | undefined;
        let loadedCICSProfileLines: string[] | undefined;

        if (workspace.getConfiguration(this.schema)) {
            programSearchHistoryLines = workspace.getConfiguration(this.schema).get(PersistentStorage.programSearchHistory);
            librarySearchHistoryLines = workspace.getConfiguration(this.schema).get(PersistentStorage.librarySearchHistory);
            transactionSearchHistoryLines = workspace.getConfiguration(this.schema).get(PersistentStorage.transactionSearchHistory);
            db2TransactionSearchHistoryLines = workspace.getConfiguration(this.schema).get(PersistentStorage.db2TransactionSearchHistory);
            localFileSearchHistoryLines = workspace.getConfiguration(this.schema).get(PersistentStorage.localFileSearchHistory);
            regionSearchHistoryLines = workspace.getConfiguration(this.schema).get(PersistentStorage.regionSearchHistory);
            loadedCICSProfileLines = workspace.getConfiguration(this.schema).get(PersistentStorage.loadedCICSProfile);
        }
        if (programSearchHistoryLines) {
            this.mProgramSearchHistory = programSearchHistoryLines;
        } else {
            await this.resetProgramSearchHistory();
        }
        if (librarySearchHistoryLines) {
            this.mLibrarySearchHistory = librarySearchHistoryLines;
        } else {
            await this.resetLibrarySearchHistory();
        }
        if (transactionSearchHistoryLines) {
            this.mTransactionSearchHistory = transactionSearchHistoryLines;
        } else {
            await this.resetTransactionSearchHistory();
        }
        if (db2TransactionSearchHistoryLines) {
            this.mDb2TransactionSearchHistory = db2TransactionSearchHistoryLines;
        } else {
            await this.resetDb2TransactionSearchHistory();
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
    public getLibrarySearchHistory(): string[] {
        return this.mLibrarySearchHistory;
    }
    public getTransactionSearchHistory(): string[] {
        return this.mTransactionSearchHistory;
    }
    public getDb2TransactionSearchHistory(): string[] {
        return this.mDb2TransactionSearchHistory;
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
    public async resetLibrarySearchHistory() {
        this.mLibrarySearchHistory = [];
        await this.updateLibrarySearchHistory();
    }
    public async resetTransactionSearchHistory() {
        this.mTransactionSearchHistory = [];
        await this.updateTransactionSearchHistory();
    }
    public async resetDb2TransactionSearchHistory() {
        this.mDb2TransactionSearchHistory = [];
        await this.updateDb2TransactionSearchHistory();
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
    private async updateLibrarySearchHistory() {
        const settings: any = { ...workspace.getConfiguration(this.schema) };
        if (settings.persistence) {
            settings[PersistentStorage.librarySearchHistory] = this.mLibrarySearchHistory;
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
    private async updateDb2TransactionSearchHistory() {
        const settings: any = { ...workspace.getConfiguration(this.schema) };
        if (settings.persistence) {
            settings[PersistentStorage.db2TransactionSearchHistory] = this.mDb2TransactionSearchHistory;
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
    
    public async addLibrarySearchHistory(criteria: string) {
        if (criteria) {
            this.mLibrarySearchHistory = this.mLibrarySearchHistory.filter((element) => {
                return element.trim() !== criteria.trim();
            });

            this.mLibrarySearchHistory.unshift(criteria);

            if (this.mLibrarySearchHistory.length > 10) {
                this.mLibrarySearchHistory.pop();
            }
            await this.updateLibrarySearchHistory();
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

    public async addDb2TransactionSearchHistory(criteria: string) {
        if (criteria) {
            this.mDb2TransactionSearchHistory = this.mDb2TransactionSearchHistory.filter((element) => {
                return element.trim() !== criteria.trim();
            });

            this.mDb2TransactionSearchHistory.unshift(criteria);

            if (this.mDb2TransactionSearchHistory.length > 10) {
                this.mDb2TransactionSearchHistory.pop();
            }
            await this.updateDb2TransactionSearchHistory();
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