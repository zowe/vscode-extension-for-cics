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

import { QuickPick, QuickPickItem, window } from "vscode";

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

export async function getPatternFromFilter(resourceName: string, resourceHistory:string[]) {
    let pattern: string;
    const desc = new FilterDescriptor(`\uFF0B Create New ${resourceName} Filter (use a comma to separate multiple patterns e.g. LG*,I*)`);
    const items = resourceHistory.map(loadedFilter => {
        return { label: loadedFilter };
    });
    const choice = await window.showQuickPick([desc, ...items]);
    if (!choice) {
        window.showInformationMessage("No Selection Made");
        return;
    }
    if (choice === desc) {
        pattern = await window.showInputBox() || "";
    } else {
        pattern = await window.showInputBox({value:choice.label}) || "";
    }
    if (!pattern) {
        window.showInformationMessage( "You must enter a pattern");
        return;
    }
    // Remove whitespace
    return pattern.replace(/\s/g, "");
}