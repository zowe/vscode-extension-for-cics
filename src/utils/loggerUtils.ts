import { IZoweLogger, getZoweDir } from "@zowe/zowe-explorer-api";
import { join as joinPaths } from "path";

export class LoggerUtil {
    // Explicit null typing used to satisfy linter rule "eqeqeq"
    static loggerObj: IZoweLogger | null = null;

    public static get instance(): IZoweLogger {
        if (LoggerUtil.loggerObj === null) {
            LoggerUtil.loggerObj = new IZoweLogger("vscode-extension-for-cics", joinPaths(getZoweDir(), "vscode-extension-for-cics"));
        }

        return LoggerUtil.loggerObj;
    }
}