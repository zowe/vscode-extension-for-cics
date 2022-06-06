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

import { QuickPick, QuickPickItem, window, workspace } from "vscode";

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
    // Replace with upper case
    pattern = pattern.toUpperCase();
    // Remove whitespace
    return pattern.replace(/\s/g, "");
}

export async function getDefaultProgramFilter() {
    let defaultCriteria = `${await workspace.getConfiguration().get('zowe.cics.program.filter')}`;
    if (!defaultCriteria || defaultCriteria.length === 0) {
        await workspace.getConfiguration().update('zowe.cics.program.filter', 'NOT (PROGRAM=CEE* OR PROGRAM=DFH* OR PROGRAM=CJ* OR PROGRAM=EYU* OR PROGRAM=CSQ* OR PROGRAM=CEL* OR PROGRAM=IGZ*)');
        defaultCriteria = 'NOT (PROGRAM=CEE* OR PROGRAM=DFH* OR PROGRAM=CJ* OR PROGRAM=EYU* OR PROGRAM=CSQ* OR PROGRAM=CEL* OR PROGRAM=IGZ*)';
    }
    return defaultCriteria;
}

export async function getDefaultTransactionFilter() {
    let defaultCriteria = `${await workspace.getConfiguration().get('zowe.cics.transaction.filter')}`;
    if (!defaultCriteria || defaultCriteria.length === 0) {
      await workspace.getConfiguration().update('zowe.cics.transaction.filter', 'NOT (program=DFH* OR program=EYU*)');
      defaultCriteria = 'NOT (program=DFH* OR program=EYU*)';
    }
    return defaultCriteria;
}

export function toEscapedCriteriaString(activeFilter:string, attribute:string): string {
    // returns a string as an escaped_criteria_string suitable for the criteria 
    // query parameter for a CMCI request.
    let criteria;
    const splitActiveFilter = activeFilter.split(",");
    criteria = "(";
    for (const index in splitActiveFilter!) {
        criteria += `${attribute}=${splitActiveFilter[parseInt(index)]}`;
        if (parseInt(index) !== splitActiveFilter.length-1){
            criteria += " OR ";
        }
    }
    criteria += ")";
    return criteria;
}
