import { IProfileLoaded } from "@zowe/imperative";

export class ProfileStorage {
  constructor(profiles?: IProfileLoaded[]) {
    if (profiles) {
      this.setProfiles(profiles);
    }
  }

  private static allCICSProfiles: IProfileLoaded[];

  public setProfiles(profiles: IProfileLoaded[]) {
    ProfileStorage.allCICSProfiles = profiles;
  }

  public getProfiles() {
    return ProfileStorage.allCICSProfiles;
  }
}
