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

import { env, extensions, window, workspace } from "vscode";

export function isTheia(): boolean {
  const VSCODE_APPNAME: string[] = ["Visual Studio Code", "VSCodium"];
  const appName = env.appName;
  if (appName && !VSCODE_APPNAME.includes(appName)) {
    return true;
  }
  return false;
}

export async function openConfigFile(filePath: string): Promise<void> {
  const document = await workspace.openTextDocument(filePath);
  await window.showTextDocument(document);
}

export function getZoweExplorerVersion(): string | undefined {
  const extension = extensions.getExtension("zowe.vscode-extension-for-zowe");
  return extension?.packageJSON?.version;
}
