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

import { ISaveProfile } from "@zowe/imperative";
import { ZoweVsCodeExtension } from "@zowe/zowe-explorer-api";

export class ProfileManagement {

  private static zoweExplorerAPI = ZoweVsCodeExtension.getZoweExplorerApi('1.17.0');
  private static profilesCache = ProfileManagement.zoweExplorerAPI.getExplorerExtenderApi().getProfilesCache();

  constructor() { }

  public static apiDoesExist() {
    if (ProfileManagement.zoweExplorerAPI) { return true; }
    return false;
  }

  public static getExplorerApis() {
    return ProfileManagement.zoweExplorerAPI;
  }

  public static getProfilesCache() {
    return ProfileManagement.profilesCache;
  }

  public static async createNewProfile(formResponse: any) {

    const newProfile: ISaveProfile = {
      profile: {
        name: formResponse.name,
        host: formResponse.session.hostname,
        port: formResponse.session.port,
        user: formResponse.session.user,
        password: formResponse.session.password,
        rejectUnauthorized: formResponse.session.rejectUnauthorized,
        protocol: formResponse.session.protocol,
        regionName: formResponse.region,
        cicsPlex: formResponse.cicsPlex,
      },
      name: formResponse.name,
      type: "cics",
      overwrite: true,
    };

    await ProfileManagement.profilesCache.getCliProfileManager('cics').save(newProfile);
  }

}