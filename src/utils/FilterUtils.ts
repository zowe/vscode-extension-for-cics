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

import { QuickPick, QuickPickItem } from "vscode";

export async function resolveQuickPickHelper(
    quickpick: QuickPick<QuickPickItem>
): Promise<QuickPickItem | undefined> {
    return new Promise<QuickPickItem | undefined>((c) =>
        quickpick.onDidAccept(() => c(quickpick.activeItems[0]))
    );
}

export class FilterDescriptor implements QuickPickItem {
    constructor(private text: string) { }
    get label(): string {
        return this.text;
    }
    get description(): string {
        return "";
    }
    get alwaysShow(): boolean {
        return true;
    }
}