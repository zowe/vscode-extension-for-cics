import { workspace } from "vscode";

export async function getDefaultProgramFilter() {
    let defaultCriteria = `${await workspace.getConfiguration().get('Zowe.CICS.Program.Filter')}`;
    if (!defaultCriteria || defaultCriteria.length === 0) {
        await workspace.getConfiguration().update('Zowe.CICS.Program.Filter', 'NOT (PROGRAM=CEE* OR PROGRAM=DFH* OR PROGRAM=CJ* OR PROGRAM=EYU* OR PROGRAM=CSQ* OR PROGRAM=CEL* OR PROGRAM=IGZ*)');
        defaultCriteria = 'NOT (PROGRAM=CEE* OR PROGRAM=DFH* OR PROGRAM=CJ* OR PROGRAM=EYU* OR PROGRAM=CSQ* OR PROGRAM=CEL* OR PROGRAM=IGZ*)';
    }
    return defaultCriteria;
}