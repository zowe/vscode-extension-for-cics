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

import { workspace } from "vscode";

export async function getDefaultProgramFilter() {
    let defaultCriteria = `${await workspace.getConfiguration().get('Zowe.CICS.Program.Filter')}`;
    if (!defaultCriteria || defaultCriteria.length === 0) {
        await workspace.getConfiguration().update('Zowe.CICS.Program.Filter', 'NOT (PROGRAM=CEE* OR PROGRAM=DFH* OR PROGRAM=CJ* OR PROGRAM=EYU* OR PROGRAM=CSQ* OR PROGRAM=CEL* OR PROGRAM=IGZ*)');
        defaultCriteria = 'NOT (PROGRAM=CEE* OR PROGRAM=DFH* OR PROGRAM=CJ* OR PROGRAM=EYU* OR PROGRAM=CSQ* OR PROGRAM=CEL* OR PROGRAM=IGZ*)';
    }
    return defaultCriteria;
}