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
