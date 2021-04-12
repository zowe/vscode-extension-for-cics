import * as imperative_1 from '@zowe/imperative';

export class CicsSession {

    session: imperative_1.Session;
    context: string;

    constructor(session: imperative_1.Session, context: string) {
        this.session = session;
        this.context = context;
    }

}

