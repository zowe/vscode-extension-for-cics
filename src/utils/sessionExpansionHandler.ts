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

import { CICSSessionTree } from "../trees/CICSSessionTree";
import { CICSTree } from "../trees/CICSTree";
import { ProfileManagement } from "./profileManagement";

export async function sessionExpansionHandler(session: CICSSessionTree, tree:CICSTree) {
    const profile = await ProfileManagement.getProfilesCache().loadNamedProfile(session.label?.toString()!, 'cics');
    await tree.loadProfile(profile, tree.getLoadedProfiles().indexOf(session), session);
}