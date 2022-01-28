/* eslint-disable @typescript-eslint/naming-convention */
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

import { IDeleteProfile, IProfileLoaded, ISaveProfile, IUpdateProfile } from "@zowe/imperative";
import { ZoweVsCodeExtension } from "@zowe/zowe-explorer-api";
import axios, { AxiosRequestConfig } from "axios";
import { window } from "vscode";
import { xml2json } from "xml-js";
import cicsProfileMeta from "./profileDefinition";
import * as https from "https";
import { CICSPlexTree } from "../trees/CICSPlexTree";

export class ProfileManagement {

  private static zoweExplorerAPI = ZoweVsCodeExtension.getZoweExplorerApi('1.18.0');
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

  public static async deleteProfile(formResponse: IDeleteProfile) {
    await ProfileManagement.profilesCache.getCliProfileManager('cics').delete(formResponse);
    await ProfileManagement.getExplorerApis().getExplorerExtenderApi().reloadProfiles();
  }

  public static async makeRequest(path:string, config:AxiosRequestConfig) {
    const response = await axios.get(path, config);
    return response;
  }

  public static cmciResponseXml2Json(data: string) {
    return JSON.parse(xml2json(data, { compact: true, spaces: 4 }));
  }

  public static async getPlexInfo(profile: IProfileLoaded) {
    const config: AxiosRequestConfig = {
      baseURL: `${profile!.profile!.protocol}://${profile!.profile!.host}:${profile!.profile!.port}/CICSSystemManagement`,
      auth: {
        username: profile!.profile!.user,
        password: profile!.profile!.password,
      }
    };
    const infoLoaded: { 
      plexname: string | null,
      regions: any[],
      group: boolean 
    }[] = [];

    https.globalAgent.options.rejectUnauthorized = profile!.profile!.rejectUnauthorized;

    if (profile!.profile!.cicsPlex) {
      if (profile!.profile!.regionName) {
        /**
         * Both Supplied, no searching required - Only load 1 region
         */
        const checkIfSystemGroup = await ProfileManagement.makeRequest(
          `/CICSRegionGroup/${profile!.profile!.cicsPlex}/${profile!.profile!.regionName}?CRITERIA=(GROUP=${profile!.profile!.regionName})`,
          config
          );
        const regionGroupJson = ProfileManagement.cmciResponseXml2Json(checkIfSystemGroup.data);
        if (regionGroupJson.response.resultsummary && 
          regionGroupJson.response.resultsummary._attributes && 
          regionGroupJson.response.resultsummary._attributes.recordcount !== '0') {
          // CICSGroup
          const singleGroupResponse = await ProfileManagement.makeRequest(
            `/CICSManagedRegion/${profile!.profile!.cicsPlex}/${profile!.profile!.regionName}`,
            config
            );
          const jsonFromXml = ProfileManagement.cmciResponseXml2Json(singleGroupResponse.data);
          const allRegions = jsonFromXml.response.records.cicsmanagedregion.map((item: { _attributes: any; }) => item._attributes);
          infoLoaded.push({
            plexname: profile!.profile!.cicsPlex,
            regions: [allRegions],
            group: true
          });
        } else {
          // Region
          const singleRegionResponse = await ProfileManagement.makeRequest(
            `/CICSManagedRegion/${profile!.profile!.cicsPlex}/${profile!.profile!.regionName}`,
            config
            );
          const jsonFromXml = ProfileManagement.cmciResponseXml2Json(singleRegionResponse.data);
          if (jsonFromXml.response.records && jsonFromXml.response.records.cicsmanagedregion) {
            const singleRegion = jsonFromXml.response.records.cicsmanagedregion._attributes;
            infoLoaded.push({
              plexname: profile!.profile!.cicsPlex,
              regions: [singleRegion],
              group: false
            });
          } else {
            window.showErrorMessage(`Cannot find region ${profile!.profile!.regionName} in plex ${profile!.profile!.cicsPlex} for profile ${profile!.name}`);
            https.globalAgent.options.rejectUnauthorized = undefined;
            throw new Error("Region Not Found");
          }
        }
      } else {
        /**
         * Plex given - must search for regions
         */
        const allRegionResponse = await ProfileManagement.makeRequest(`/CICSManagedRegion/${profile!.profile!.cicsPlex}`, config);
        const jsonFromXml = ProfileManagement.cmciResponseXml2Json(allRegionResponse.data);
        if (jsonFromXml.response.records && jsonFromXml.response.records.cicsmanagedregion) {
          const allRegions = jsonFromXml.response.records.cicsmanagedregion.map((item: { _attributes: any; }) => item._attributes);
          infoLoaded.push({
            plexname: profile!.profile!.cicsPlex,
            regions: allRegions,
            group: false
          });
        } else {
          window.showErrorMessage(`Cannot find plex ${profile!.profile!.cicsPlex} for profile ${profile!.name}`);
          https.globalAgent.options.rejectUnauthorized = undefined;
          throw new Error("Plex Not Found");
        }
      }
    } else {
      if (profile!.profile!.regionName) {
        /**
         * Region but no plex - Single region system, use that
         */
        const singleRegionResponse = await ProfileManagement.makeRequest(`/CICSRegion/${profile!.profile!.regionName}`, config);
        const jsonFromXml = ProfileManagement.cmciResponseXml2Json(singleRegionResponse.data);
        if (jsonFromXml.response.records && jsonFromXml.response.records.cicsregion) {
          const singleRegion = jsonFromXml.response.records.cicsregion._attributes;
          infoLoaded.push({
            plexname: null,
            regions: [singleRegion],
            group: false
          });
        } else {
          window.showErrorMessage(`Cannot find region ${profile!.profile!.regionName} for profile ${profile!.name}`);
          https.globalAgent.options.rejectUnauthorized = undefined;
          throw new Error("Region Not Found");
        }
      } else {
        /**
         * Nothing given - Test if plex and find all info
         */
        try {
          const testIfPlexResponse = await ProfileManagement.makeRequest(`/CICSCICSPlex`, config);
          if (testIfPlexResponse.status === 200) {
            // Plex
            const jsonFromXml = ProfileManagement.cmciResponseXml2Json(testIfPlexResponse.data,);
            if (jsonFromXml.response.records && jsonFromXml.response.records.cicscicsplex) {
              const returnedPlexes = jsonFromXml.response.records.cicscicsplex.map((item: { _attributes: any; }) => item._attributes);
              const uniqueReturnedPlexes = returnedPlexes.filter((plex:any, index:number) =>
                index === returnedPlexes.findIndex((found:any) => (
                  found.plexname === plex.plexname
                ))
              );
              for (const plex of uniqueReturnedPlexes) {
                try {
                  infoLoaded.push({
                    plexname: plex.plexname,
                    regions: [],
                    group: false
                  });
                } catch (error) {
                   console.log(error);
                }
              }
            }
          } else {
            // Not Plex
            const singleRegion = await ProfileManagement.makeRequest(`/CICSRegion`, config);
            const jsonFromXml = ProfileManagement.cmciResponseXml2Json(singleRegion.data);
            const returnedRegion = jsonFromXml.response.records.cicsregion._attributes;
            infoLoaded.push({
              plexname: null,
              regions: [returnedRegion],
              group: false
            });
          }
        } catch (error) {
          // Not Plex - Could be error
          try {
            const singleRegion = await ProfileManagement.makeRequest(`/CICSRegion`, config);
            const jsonFromXml = JSON.parse(xml2json(singleRegion.data, { compact: true, spaces: 4 }));
            if (!jsonFromXml) {
              throw error;
            }
            const returnedRegion = jsonFromXml.response.records.cicsregion._attributes;
            infoLoaded.push({
              plexname: null,
              regions: [returnedRegion],
              group: false
            });
          } catch (error) {
            https.globalAgent.options.rejectUnauthorized = undefined;
            throw error;
          }
        }
      }
    }
    https.globalAgent.options.rejectUnauthorized = undefined;
    return infoLoaded;
  }

  public static async getRegionInfoInPlex(plex: CICSPlexTree) {
    try {
      const profile = plex.getProfile();
      const config: AxiosRequestConfig = {
        baseURL: `${profile!.profile!.protocol}://${profile!.profile!.host}:${profile!.profile!.port}/CICSSystemManagement`,
        auth: {
          username: profile!.profile!.user,
          password: profile!.profile!.password,
        }
      };
      https.globalAgent.options.rejectUnauthorized = profile!.profile!.rejectUnauthorized;
      const regionResponse = await ProfileManagement.makeRequest(`/CICSManagedRegion/${plex.getPlexName()}`, config);
      https.globalAgent.options.rejectUnauthorized = undefined;
      if (regionResponse.status === 200) {
        const jsonFromXml = ProfileManagement.cmciResponseXml2Json(regionResponse.data);
        if (jsonFromXml.response.records && jsonFromXml.response.records.cicsmanagedregion) {
          const returnedRegions = jsonFromXml.response.records.cicsmanagedregion.map((item: { _attributes: any; }) => item._attributes);
          return returnedRegions;
        }
      }
    } catch (error) {
        console.log(error);
        window.showErrorMessage(`Cannot find plex ${plex.getPlexName()} for profile ${plex.getParent().label}`);
        throw new Error("Plex Not Found");
    }
  }

  public static async generateCacheToken(profile: IProfileLoaded, plexName: string, resourceName:string, criteria?: string, group?: string) {
    try {
      const config: AxiosRequestConfig = {
        baseURL: `${profile!.profile!.protocol}://${profile!.profile!.host}:${profile!.profile!.port}/CICSSystemManagement`,
        auth: {
          username: profile!.profile!.user,
          password: profile!.profile!.password,
        },
        params: {
          OVERRIDEWARNINGCOUNT: 'YES',
          CRITERIA: criteria,
          NODISCARD: '',
          SUMMONLY: '',
        }
      };
      https.globalAgent.options.rejectUnauthorized = profile!.profile!.rejectUnauthorized;
      const allProgramsResponse = await ProfileManagement.makeRequest(`/${resourceName}/${plexName}${group?`/${group}`:''}`,config);
      https.globalAgent.options.rejectUnauthorized = undefined;
      if (allProgramsResponse.status === 200) {
        const jsonFromXml = ProfileManagement.cmciResponseXml2Json(allProgramsResponse.data);
        if (jsonFromXml.response && jsonFromXml.response.resultsummary) {
          const resultsSummary = jsonFromXml.response.resultsummary._attributes;
          return { 'cacheToken': resultsSummary.cachetoken, 'recordCount': resultsSummary.recordcount};
        }
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public static async getCachedResources(profile: IProfileLoaded, cacheToken: string, resourceName:string, start=1, increment=800) {
    try {
      const config: AxiosRequestConfig = {
        baseURL: `${profile!.profile!.protocol}://${profile!.profile!.host}:${profile!.profile!.port}/CICSSystemManagement`,
        auth: {
          username: profile!.profile!.user,
          password: profile!.profile!.password,
        }
      };
      https.globalAgent.options.rejectUnauthorized = profile!.profile!.rejectUnauthorized;
      const allItemsResponse = await ProfileManagement.makeRequest(`/CICSResultCache/${cacheToken}/${start}/${increment}`, config);
      https.globalAgent.options.rejectUnauthorized = undefined;
      if (allItemsResponse.status === 200) {
        const jsonFromXml = ProfileManagement.cmciResponseXml2Json(allItemsResponse.data);
        if (jsonFromXml.response && jsonFromXml.response.records && jsonFromXml.response.records[resourceName.toLowerCase()]) {
          const returnedResources = jsonFromXml.response.records[resourceName.toLowerCase()].map((item: { _attributes: any; }) => item._attributes);
          return returnedResources;
        }
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}