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

export async function getDefaultTransactionFilter() {
    let defaultCriteria = `${await workspace.getConfiguration().get('Zowe.CICS.Transaction.Filter')}`;
    if (!defaultCriteria || defaultCriteria.length === 0) {
      await workspace.getConfiguration().update('Zowe.CICS.Transaction.Filter', 'NOT (program=DFH* OR program=EYU*)');
      defaultCriteria = 'NOT (program=DFH* OR program=EYU*)';
    }
    return defaultCriteria;
}