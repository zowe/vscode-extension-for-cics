import * as imperative from "@zowe/imperative";


export class CicsApi {
    private session?: imperative.Session;

    public constructor(public profile?: imperative.IProfileLoaded) {}

    public static getProfileTypeName(): string {
        return "cics";
    }

    public getSession(profile?: imperative.IProfileLoaded): imperative.Session {
        if (!this.session) {
            const cicsProfile = (profile || this.profile)?.profile;
            if (!cicsProfile) {
                throw new Error(
                    "Internal error: CICS Profile Fail"
                );
            }
            this.session = new imperative.Session({
                hostname: cicsProfile.host,
                port: cicsProfile.port,
                user: cicsProfile.user,
                password: cicsProfile.password,
                rejectUnauthorized: cicsProfile.rejectUnauthorized,
            });
        }
        return this.session;
    }

    public getProfileTypeName(): string {
        return CicsApi.getProfileTypeName();
    }
}