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