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

import { IZoweLogger, getZoweDir } from "@zowe/zowe-explorer-api";
import { join as joinPaths } from "path";

export class LoggerUtils {
  // Explicit null typing used to satisfy linter rule "eqeqeq"
  static loggerObj: IZoweLogger | null = null;

  public static get instance(): IZoweLogger {
    if (LoggerUtils.loggerObj === null) {
      LoggerUtils.loggerObj = new IZoweLogger("vscode-extension-for-cics", joinPaths(getZoweDir(), "vscode-extension-for-cics"));
    }

    return LoggerUtils.loggerObj;
  }
}
