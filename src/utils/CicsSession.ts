import { IProfileLoaded, Session } from "@zowe/imperative";
import { ZoweExplorerApi } from "@zowe/zowe-explorer-api";
import {
  IListOptions,
  IZosFilesResponse,
  IDownloadOptions,
  IUploadOptions,
  CreateDataSetTypeEnum,
  ICreateDataSetOptions,
  IDataSet,
  IDeleteDatasetOptions,
} from "@zowe/zos-files-for-zowe-sdk";
export class CicsSession {
  session: Session;
  cicsPlex: string;
  region: string;

  constructor(session: Session, cicsPlex?: string, region?: string) {
    this.session = session;
    this.cicsPlex = cicsPlex!;
    this.region = region!;
  }
}

export class CicsApi implements ZoweExplorerApi.IMvs {
  private session?: Session;

  public constructor(public profile?: IProfileLoaded) {}
  dataSet(filter: string, options?: IListOptions): Promise<IZosFilesResponse> {
    throw new Error("Method not implemented.");
  }
  allMembers(
    dataSetName: string,
    options?: IListOptions
  ): Promise<IZosFilesResponse> {
    throw new Error("Method not implemented.");
  }
  getContents(
    dataSetName: string,
    options?: IDownloadOptions
  ): Promise<IZosFilesResponse> {
    throw new Error("Method not implemented.");
  }
  putContents(
    inputFilePath: string,
    dataSetName: string,
    options?: IUploadOptions
  ): Promise<IZosFilesResponse> {
    throw new Error("Method not implemented.");
  }
  createDataSet(
    dataSetType: CreateDataSetTypeEnum,
    dataSetName: string,
    options?: Partial<ICreateDataSetOptions>
  ): Promise<IZosFilesResponse> {
    throw new Error("Method not implemented.");
  }
  createDataSetMember(
    dataSetName: string,
    options?: IUploadOptions
  ): Promise<IZosFilesResponse> {
    throw new Error("Method not implemented.");
  }
  allocateLikeDataSet(
    dataSetName: string,
    likeDataSetName: string
  ): Promise<IZosFilesResponse> {
    throw new Error("Method not implemented.");
  }
  copyDataSetMember(
    { dataSetName: fromDataSetName, memberName: fromMemberName }: IDataSet,
    { dataSetName: toDataSetName, memberName: toMemberName }: IDataSet,
    options?: { replace?: boolean | undefined }
  ): Promise<IZosFilesResponse> {
    throw new Error("Method not implemented.");
  }
  renameDataSet(
    currentDataSetName: string,
    newDataSetName: string
  ): Promise<IZosFilesResponse> {
    throw new Error("Method not implemented.");
  }
  renameDataSetMember(
    dataSetName: string,
    currentMemberName: string,
    newMemberName: string
  ): Promise<IZosFilesResponse> {
    throw new Error("Method not implemented.");
  }
  hMigrateDataSet(dataSetName: string): Promise<IZosFilesResponse> {
    throw new Error("Method not implemented.");
  }
  hRecallDataSet(dataSetName: string): Promise<IZosFilesResponse> {
    throw new Error("Method not implemented.");
  }
  deleteDataSet(
    dataSetName: string,
    options?: IDeleteDatasetOptions
  ): Promise<IZosFilesResponse> {
    throw new Error("Method not implemented.");
  }

  public static getProfileTypeName(): string {
    return "cics";
  }

  public getSession(profile?: IProfileLoaded): Session {
    if (!this.session) {
      const cicsProfile = (profile || this.profile)?.profile;
      if (!cicsProfile) {
        throw new Error("Internal error: CICS Profile Fail");
      }
      this.session = new Session({
        hostname: cicsProfile.host,
        port: cicsProfile.port,
        user: cicsProfile.user,
        password: cicsProfile.password,
        rejectUnauthorized: cicsProfile.rejectUnauthorized,
      });
    }
    return this.session;
  }

  public getProfileTypeName(): string {
    return CicsApi.getProfileTypeName();
  }
}
