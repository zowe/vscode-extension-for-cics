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

import { IProfileLoaded, ISaveProfile, IUpdateProfile } from "@zowe/imperative";
import { ZoweVsCodeExtension } from "@zowe/zowe-explorer-api";
import axios from "axios";
import { window } from "vscode";
import { xml2json } from "xml-js";
import cicsProfileMeta from "./profileDefinition";

export class ProfileManagement {

  private static zoweExplorerAPI = ZoweVsCodeExtension.getZoweExplorerApi('1.17.0');
  private static profilesCache = ProfileManagement.zoweExplorerAPI.getExplorerExtenderApi().getProfilesCache();

  constructor() { }

  public static apiDoesExist() {
    if (ProfileManagement.zoweExplorerAPI) { return true; }
    return false;
  }

  public static async registerCICSProfiles() {
    await ProfileManagement.zoweExplorerAPI.getExplorerExtenderApi().initForZowe('cics', cicsProfileMeta);
  }

  public static getExplorerApis() {
    return ProfileManagement.zoweExplorerAPI;
  }

  public static getProfilesCache() {
    return ProfileManagement.profilesCache;
  }

  public static async createNewProfile(formResponse: ISaveProfile) {
    await ProfileManagement.profilesCache.getCliProfileManager('cics').save(formResponse);
    await ProfileManagement.getExplorerApis().getExplorerExtenderApi().reloadProfiles();
  }

  public static async updateProfile(formResponse: IUpdateProfile) {
    const profile = await ProfileManagement.profilesCache.getCliProfileManager('cics').update(formResponse);
    await ProfileManagement.getExplorerApis().getExplorerExtenderApi().reloadProfiles();
    return profile;
  }

  public static async getPlexInfo(profile: IProfileLoaded) {

    const URL = `${profile!.profile!.protocol}://${profile!.profile!.host}:${profile!.profile!.port}/CICSSystemManagement`;
    const infoLoaded: { plexname: string | null, regions: any[]; }[] = [];

    if (profile!.profile!.cicsPlex) {
      if (profile!.profile!.regionName) {
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        /**
         * Both Supplied, no searching required - Only load 1 region
         */

        const singleRegionResponse = await axios.get(`${URL}/CICSManagedRegion/${profile!.profile!.cicsPlex}/${profile!.profile!.regionName}`);
        const jsonFromXml = JSON.parse(xml2json(singleRegionResponse.data, { compact: true, spaces: 4 }));
        if(jsonFromXml.response.records && jsonFromXml.response.records.cicsmanagedregion){
          const singleRegion = jsonFromXml.response.records.cicsmanagedregion._attributes;
          infoLoaded.push({
            plexname: profile!.profile!.cicsPlex,
            regions: [singleRegion]
          });
        } else {
          window.showErrorMessage(`Cannot find region ${profile!.profile!.regionName} in plex ${profile!.profile!.cicsPlex} for profile ${profile!.name}`);
        }

        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
      } else {
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        /**
         * Plex given - must search for regions
         */

        const allRegionResponse = await axios.get(`${URL}/CICSManagedRegion/${profile!.profile!.cicsPlex}`);
        const jsonFromXml = JSON.parse(xml2json(allRegionResponse.data, { compact: true, spaces: 4 }));
        if(jsonFromXml.response.records && jsonFromXml.response.records.cicsmanagedregion){
          const allRegions = jsonFromXml.response.records.cicsmanagedregion.map((item: { _attributes: any; }) => item._attributes);
        infoLoaded.push({
          plexname: profile!.profile!.cicsPlex,
          regions: allRegions
        });
        } else {
          window.showErrorMessage(`Cannot find plex ${profile!.profile!.cicsPlex} for profile ${profile!.name}`);
        }
        

        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
      }
    } else {
      if (profile!.profile!.regionName) {
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        /**
         * Region but no plex - Single region system, use that
         */

        const singleRegionResponse = await axios.get(`${URL}/CICSRegion/${profile!.profile!.regionName}`);
        const jsonFromXml = JSON.parse(xml2json(singleRegionResponse.data, { compact: true, spaces: 4 }));
        if (jsonFromXml.response.records && jsonFromXml.response.records.cicsregion){
          const singleRegion = jsonFromXml.response.records.cicsregion._attributes;
          infoLoaded.push({
            plexname: null,
            regions: [singleRegion]
          });
      } else {
        window.showErrorMessage(`Cannot find region ${profile!.profile!.regionName} for profile ${profile!.name}`);
      }

        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

      } else {
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
        /**
         * Nothing given - Test if plex and find all info
         */
        try {
          const testIfPlexResponse = await axios.get(`${URL}/CICSCICSPlex`);
          if (testIfPlexResponse.status === 200) {
            // Plex
            const jsonFromXml = JSON.parse(xml2json(testIfPlexResponse.data, { compact: true, spaces: 4 }));
            if (jsonFromXml.response.records && jsonFromXml.response.records.cicscicsplex){
              const returnedPlexes = jsonFromXml.response.records.cicscicsplex.map((item: { _attributes: any; }) => item._attributes);


              for (const plex of returnedPlexes) {
                try {
                  const regionResponse = await axios.get(`${URL}/CICSManagedRegion/${plex.plexname}`);
                  if (regionResponse.status === 200) {
                    const jsonFromXml = JSON.parse(xml2json(regionResponse.data, { compact: true, spaces: 4 }));
                    if (jsonFromXml.response.records && jsonFromXml.response.records.cicsmanagedregion){
                      const returnedRegions = jsonFromXml.response.records.cicsmanagedregion.map((item: { _attributes: any; }) => item._attributes);
                      infoLoaded.push({
                        plexname: plex.plexname,
                        regions: returnedRegions
                      });
                    }
                  }
                } catch (error) {
                  // console.log(error);
                }
              }
          }

          } else {
            // Not Plex

            const singleRegion = await axios.get(`${URL}/CICSRegion`);
            const jsonFromXml = JSON.parse(xml2json(singleRegion.data, { compact: true, spaces: 4 }));
            const returnedRegion = jsonFromXml.response.records.cicsregion._attributes;
            infoLoaded.push({
              plexname: null,
              regions: [returnedRegion]
            });
          }
        } catch (error) {
          // Not Plex - Could be error

          const singleRegion = await axios.get(`${URL}/CICSRegion`);
          const jsonFromXml = JSON.parse(xml2json(singleRegion.data, { compact: true, spaces: 4 }));
          const returnedRegion = jsonFromXml.response.records.cicsregion._attributes;
          infoLoaded.push({
            plexname: null,
            regions: [returnedRegion]
          });

        }
      }
    }
    return infoLoaded;
  }
}