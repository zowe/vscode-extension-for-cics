import { workspace } from "vscode";

export async function getDefaultTransactionFilter() {
    let defaultCriteria = `${await workspace.getConfiguration().get('Zowe.CICS.Transaction.Filter')}`;
    if (!defaultCriteria || defaultCriteria.length === 0) {
      await workspace.getConfiguration().update('Zowe.CICS.Transaction.Filter', 'NOT (program=DFH* OR program=EYU*)');
      defaultCriteria = 'NOT (program=DFH* OR program=EYU*)';
    }
    return defaultCriteria;
}