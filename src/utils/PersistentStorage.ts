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

import { ConfigurationTarget, workspace } from "vscode";

export class PersistentStorage {
  public schema: string;
  private static readonly programSearchHistory: string = "programSearchHistory";
  private static readonly librarySearchHistory: string = "librarySearchHistory";
  private static readonly datasetSearchHistory: string = "datasetSearchHistory";
  private static readonly transactionSearchHistory: string = "transactionSearchHistory";
  private static readonly localFileSearchHistory: string = "localFileSearchHistory";
  private static readonly regionSearchHistory: string = "regionSearchHistory";
  private static readonly loadedCICSProfile: string = "loadedCICSProfile";
  private static readonly tcpipsSearchHistory: string = "tcpipsSearchHistory";
  private static readonly urimapsSearchHistory: string = "urimapsSearchHistory";
  private static readonly pipelineSearchHistory: string = "pipelineSearchHistory";
  private static readonly webserviceSearchHistory: string = "webserviceSearchHistory";

  private mProgramSearchHistory: string[] = [];
  private mLibrarySearchHistory: string[] = [];
  private mDatasetSearchHistory: string[] = [];
  private mTransactionSearchHistory: string[] = [];
  private mLocalFileSearchHistory: string[] = [];
  private mRegionSearchHistory: string[] = [];
  private mLoadedCICSProfile: string[] = [];
  private mTCPIPSSearchHistory: string[] = [];
  private mURIMapsSearchHistory: string[] = [];
  private mPipelineSearchHistory: string[] = [];
  private mWebServiceSearchHistory: string[] = [];

  constructor(schema: string) {
    this.schema = schema;
    this.init();
  }

  private async init(): Promise<void> {
    let programSearchHistoryLines: string[] | undefined;
    let librarySearchHistoryLines: string[] | undefined;
    let datasetSearchHistoryLines: string[] | undefined;
    let transactionSearchHistoryLines: string[] | undefined;
    let localFileSearchHistoryLines: string[] | undefined;
    let regionSearchHistoryLines: string[] | undefined;
    let loadedCICSProfileLines: string[] | undefined;
    let tcpipsSearchHistoryLines: string[] | undefined;
    let urimapsSearchHistoryLines: string[] | undefined;
    let pipelineSearchHistoryLines: string[] | undefined;
    let webserviceSearchHistoryLines: string[] | undefined;

    if (workspace.getConfiguration(this.schema)) {
      programSearchHistoryLines = workspace.getConfiguration(this.schema).get(PersistentStorage.programSearchHistory);
      librarySearchHistoryLines = workspace.getConfiguration(this.schema).get(PersistentStorage.librarySearchHistory);
      datasetSearchHistoryLines = workspace.getConfiguration(this.schema).get(PersistentStorage.datasetSearchHistory);
      transactionSearchHistoryLines = workspace.getConfiguration(this.schema).get(PersistentStorage.transactionSearchHistory);
      localFileSearchHistoryLines = workspace.getConfiguration(this.schema).get(PersistentStorage.localFileSearchHistory);
      regionSearchHistoryLines = workspace.getConfiguration(this.schema).get(PersistentStorage.regionSearchHistory);
      loadedCICSProfileLines = workspace.getConfiguration(this.schema).get(PersistentStorage.loadedCICSProfile);
      tcpipsSearchHistoryLines = workspace.getConfiguration(this.schema).get(PersistentStorage.tcpipsSearchHistory);
      urimapsSearchHistoryLines = workspace.getConfiguration(this.schema).get(PersistentStorage.urimapsSearchHistory);
      pipelineSearchHistoryLines = workspace.getConfiguration(this.schema).get(PersistentStorage.pipelineSearchHistory);
      webserviceSearchHistoryLines = workspace.getConfiguration(this.schema).get(PersistentStorage.webserviceSearchHistory);
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
    if (datasetSearchHistoryLines) {
      this.mDatasetSearchHistory = datasetSearchHistoryLines;
    } else {
      await this.resetDatasetSearchHistory();
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
    if (tcpipsSearchHistoryLines) {
      this.mTCPIPSSearchHistory = tcpipsSearchHistoryLines;
    } else {
      await this.resetTCPIPSSearchHistory();
    }
    if (urimapsSearchHistoryLines) {
      this.mURIMapsSearchHistory = urimapsSearchHistoryLines;
    } else {
      await this.resetURIMapsSearchHistory();
    }
    if (pipelineSearchHistoryLines) {
      this.mPipelineSearchHistory = pipelineSearchHistoryLines;
    } else {
      await this.resetPipelineSearchHistory();
    }
    if (webserviceSearchHistoryLines) {
      this.mWebServiceSearchHistory = webserviceSearchHistoryLines;
    } else {
      await this.resetWebServiceSearchHistory();
    }
  }

  public getProgramSearchHistory(): string[] {
    return this.mProgramSearchHistory;
  }
  public getLibrarySearchHistory(): string[] {
    return this.mLibrarySearchHistory;
  }
  public getDatasetSearchHistory(): string[] {
    return this.mDatasetSearchHistory;
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
  public getTCPIPSSearchHistory(): string[] {
    return this.mTCPIPSSearchHistory;
  }
  public getURIMapSearchHistory(): string[] {
    return this.mURIMapsSearchHistory;
  }
  public getPipelineSearchHistory(): string[] {
    return this.mPipelineSearchHistory;
  }
  public getWebServiceSearchHistory(): string[] {
    return this.mWebServiceSearchHistory;
  }

  public async resetProgramSearchHistory(): Promise<void> {
    this.mProgramSearchHistory = [];
    await this.updateProgramSearchHistory();
  }
  public async resetLibrarySearchHistory(): Promise<void> {
    this.mLibrarySearchHistory = [];
    await this.updateLibrarySearchHistory();
  }
  public async resetDatasetSearchHistory(): Promise<void> {
    this.mDatasetSearchHistory = [];
    await this.updateDatasetSearchHistory();
  }
  public async resetTransactionSearchHistory(): Promise<void> {
    this.mTransactionSearchHistory = [];
    await this.updateTransactionSearchHistory();
  }
  public async resetLocalFileSearchHistory(): Promise<void> {
    this.mLocalFileSearchHistory = [];
    await this.updateLocalFileSearchHistory();
  }
  public async resetRegionSearchHistory(): Promise<void> {
    this.mRegionSearchHistory = [];
    await this.updateRegionSearchHistory();
  }
  public async resetLoadedCICSProfile(): Promise<void> {
    this.mLoadedCICSProfile = [];
    await this.updateLoadedCICSProfile();
  }
  public async resetTCPIPSSearchHistory(): Promise<void> {
    this.mTCPIPSSearchHistory = [];
    await this.updateTCPIPSSearchHistory();
  }
  public async resetURIMapsSearchHistory(): Promise<void> {
    this.mURIMapsSearchHistory = [];
    await this.updateURIMapsSearchHistory();
  }
  public async resetPipelineSearchHistory(): Promise<void> {
    this.mPipelineSearchHistory = [];
    await this.updatePipelineSearchHistory();
  }
  public async resetWebServiceSearchHistory(): Promise<void> {
    this.mWebServiceSearchHistory = [];
    await this.updateWebServiceSearchHistory();
  }

  private async updateProgramSearchHistory(): Promise<void> {
    const settings: any = { ...workspace.getConfiguration(this.schema) };
    if (settings.persistence) {
      settings[PersistentStorage.programSearchHistory] = this.mProgramSearchHistory;
      await workspace.getConfiguration().update(this.schema, settings, ConfigurationTarget.Global);
    }
  }
  private async updateLibrarySearchHistory(): Promise<void> {
    const settings: any = { ...workspace.getConfiguration(this.schema) };
    if (settings.persistence) {
      settings[PersistentStorage.librarySearchHistory] = this.mLibrarySearchHistory;
      await workspace.getConfiguration().update(this.schema, settings, ConfigurationTarget.Global);
    }
  }
  private async updateDatasetSearchHistory(): Promise<void> {
    const settings: any = { ...workspace.getConfiguration(this.schema) };
    if (settings.persistence) {
      settings[PersistentStorage.datasetSearchHistory] = this.mDatasetSearchHistory;
      await workspace.getConfiguration().update(this.schema, settings, ConfigurationTarget.Global);
    }
  }
  private async updateTransactionSearchHistory(): Promise<void> {
    const settings: any = { ...workspace.getConfiguration(this.schema) };
    if (settings.persistence) {
      settings[PersistentStorage.transactionSearchHistory] = this.mTransactionSearchHistory;
      await workspace.getConfiguration().update(this.schema, settings, ConfigurationTarget.Global);
    }
  }
  private async updateLocalFileSearchHistory(): Promise<void> {
    const settings: any = { ...workspace.getConfiguration(this.schema) };
    if (settings.persistence) {
      settings[PersistentStorage.localFileSearchHistory] = this.mLocalFileSearchHistory;
      await workspace.getConfiguration().update(this.schema, settings, ConfigurationTarget.Global);
    }
  }
  private async updateRegionSearchHistory(): Promise<void> {
    const settings: any = { ...workspace.getConfiguration(this.schema) };
    if (settings.persistence) {
      settings[PersistentStorage.regionSearchHistory] = this.mRegionSearchHistory;
      await workspace.getConfiguration().update(this.schema, settings, ConfigurationTarget.Global);
    }
  }
  private async updateLoadedCICSProfile(): Promise<void> {
    const settings: any = { ...workspace.getConfiguration(this.schema) };
    if (settings.persistence) {
      settings[PersistentStorage.loadedCICSProfile] = this.mLoadedCICSProfile;
      await workspace.getConfiguration().update(this.schema, settings, ConfigurationTarget.Global);
    }
  }
  private async updateTCPIPSSearchHistory(): Promise<void> {
    const settings: any = { ...workspace.getConfiguration(this.schema) };
    if (settings.persistence) {
      settings[PersistentStorage.tcpipsSearchHistory] = this.mTCPIPSSearchHistory;
      await workspace.getConfiguration().update(this.schema, settings, ConfigurationTarget.Global);
    }
  }
  private async updateURIMapsSearchHistory(): Promise<void> {
    const settings: any = { ...workspace.getConfiguration(this.schema) };
    if (settings.persistence) {
      settings[PersistentStorage.urimapsSearchHistory] = this.mURIMapsSearchHistory;
      await workspace.getConfiguration().update(this.schema, settings, ConfigurationTarget.Global);
    }
  }

  private async updatePipelineSearchHistory(): Promise<void> {
    const settings: any = { ...workspace.getConfiguration(this.schema) };
    if (settings.persistence) {
      settings[PersistentStorage.pipelineSearchHistory] = this.mPipelineSearchHistory;
      await workspace.getConfiguration().update(this.schema, settings, ConfigurationTarget.Global);
    }
  }

  private async updateWebServiceSearchHistory(): Promise<void> {
    const settings: any = { ...workspace.getConfiguration(this.schema) };
    if (settings.persistence) {
      settings[PersistentStorage.webserviceSearchHistory] = this.mWebServiceSearchHistory;
      await workspace.getConfiguration().update(this.schema, settings, ConfigurationTarget.Global);
    }
  }

  public async addProgramSearchHistory(criteria: string): Promise<void> {
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

  public async addLibrarySearchHistory(criteria: string): Promise<void> {
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

  public async addDatasetSearchHistory(criteria: string): Promise<void> {
    if (criteria) {
      this.mDatasetSearchHistory = this.mDatasetSearchHistory.filter((element) => {
        return element.trim() !== criteria.trim();
      });

      this.mDatasetSearchHistory.unshift(criteria);

      if (this.mDatasetSearchHistory.length > 10) {
        this.mDatasetSearchHistory.pop();
      }
      await this.updateDatasetSearchHistory();
    }
  }

  public async addTransactionSearchHistory(criteria: string): Promise<void> {
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

  public async addLocalFileSearchHistory(criteria: string): Promise<void> {
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

  public async addRegionSearchHistory(criteria: string): Promise<void> {
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

  public async addLoadedCICSProfile(name: string): Promise<void> {
    if (name) {
      this.mLoadedCICSProfile = this.mLoadedCICSProfile.filter((element) => {
        return element.trim() !== name.trim();
      });

      this.mLoadedCICSProfile.unshift(name);
      await this.updateLoadedCICSProfile();
    }
  }

  public async addTCPIPSSearchHistory(criteria: string): Promise<void> {
    if (criteria) {
      this.mTCPIPSSearchHistory = this.mTCPIPSSearchHistory.filter((element) => {
        return element.trim() !== criteria.trim();
      });

      this.mTCPIPSSearchHistory.unshift(criteria);

      if (this.mTCPIPSSearchHistory.length > 10) {
        this.mTCPIPSSearchHistory.pop();
      }
      await this.updateTCPIPSSearchHistory();
    }
  }

  public async addURIMapsSearchHistory(criteria: string): Promise<void> {
    if (criteria) {
      this.mURIMapsSearchHistory = this.mURIMapsSearchHistory.filter((element) => {
        return element.trim() !== criteria.trim();
      });

      this.mURIMapsSearchHistory.unshift(criteria);

      if (this.mURIMapsSearchHistory.length > 10) {
        this.mURIMapsSearchHistory.pop();
      }
      await this.updateURIMapsSearchHistory();
    }
  }

  public async addPipelineSearchHistory(criteria: string): Promise<void> {
    if (criteria) {
      this.mPipelineSearchHistory = this.mPipelineSearchHistory.filter((element) => {
        return element.trim() !== criteria.trim();
      });

      this.mPipelineSearchHistory.unshift(criteria);

      if (this.mPipelineSearchHistory.length > 10) {
        this.mPipelineSearchHistory.pop();
      }
      await this.updatePipelineSearchHistory();
    }
  }

  public async addWebServiceSearchHistory(criteria: string): Promise<void> {
    if (criteria) {
      this.mWebServiceSearchHistory = this.mWebServiceSearchHistory.filter((element) => {
        return element.trim() !== criteria.trim();
      });

      this.mWebServiceSearchHistory.unshift(criteria);

      if (this.mWebServiceSearchHistory.length > 10) {
        this.mWebServiceSearchHistory.pop();
      }
      await this.updateWebServiceSearchHistory();
    }
  }

  public async removeLoadedCICSProfile(name: string): Promise<void> {
    if (name) {
      this.mLoadedCICSProfile = this.mLoadedCICSProfile.filter((element) => {
        return element.trim() !== name.trim();
      });

      await this.updateLoadedCICSProfile();
    }
  }
}
