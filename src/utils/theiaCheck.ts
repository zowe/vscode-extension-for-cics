import * as vscode from 'vscode';

export function isTheia(): boolean {
    const VSCODE_APPNAME: string[] = ["Visual Studio Code", "VSCodium"];
    const appName = vscode.env.appName;
    if (appName && !VSCODE_APPNAME.includes(appName)) {
        return true;
    }
    return false;
}