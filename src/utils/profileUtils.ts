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

import { ZoweVsCodeExtension } from "@zowe/zowe-explorer-api";
import { join } from "path";
import { CICSTree } from "../trees/CICSTree";
import { window } from "vscode";
import { IProfileLoaded } from "@zowe/imperative";

export function missingSessionParameters(profileProfile: any): (string | undefined)[] {
  const params = ["host", "port", "user", "password", "rejectUnauthorized", "protocol"];
  const missing: (string | undefined)[] = [];
  for (const value of params) {
    if (profileProfile[value] === undefined) {
      missing.push(value);
    }
  }
  return missing;
}

export function getIconPathInResources(iconFileNameLight: string, iconFileNameDark: string): { light: string; dark: string } {
  return {
    light: join(__dirname, "..", "..", "resources", "imgs", iconFileNameLight),
    dark: join(__dirname, "..", "..", "resources", "imgs", iconFileNameDark),
  };
}

export async function promptCredentials(sessionName: string, rePrompt?: boolean): Promise<IProfileLoaded> {
  // const mProfileInfo = new ProfileInfo("zowe", {
  //   requireKeytar: () => getSecurityModules("keytar", isTheia())!,
  // });
  // await mProfileInfo.readProfilesFromDisk();
  // ProfilesCache.createConfigInstance(mProfileInfo);
  const promptInfo = await ZoweVsCodeExtension.promptCredentials({
    sessionName,
    rePrompt,
  });
  if (!promptInfo) {
    window.showInformationMessage("Input credentials operation Cancelled");
  }
  return promptInfo;
}

export function setIconClosed(node: any, tree: CICSTree): void {
  node.element.iconPath = getIconPathInResources("folder-closed-dark.svg", "folder-closed-light.svg");
  tree._onDidChangeTreeData.fire(undefined);
}
