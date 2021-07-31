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

import { ICommandProfileTypeConfiguration } from "@zowe/imperative";

const cicsProfileMeta = [
    {
        type: "cics",
        schema: {
            type: "object",
            title: "CICS Profile",
            description: "A cics profile is required to issue commands in the cics command group that interact with " +
                "CICS regions. The cics profile contains your host, port, user name, and password " +
                "for the IBM CICS management client interface (CMCI) server of your choice.",
            properties: {
                host: {
                    type: "string",
                    optionDefinition: {
                        name: "host",
                        aliases: ["H"],
                        description: "The CMCI server host name",
                        type: "string",
                        required: true,
                    },
                },
                port: {
                    type: "number",
                    optionDefinition: {
                        name: "port",
                        aliases: ["P"],
                        description: "The CMCI server port",
                        type: "number",
                        defaultValue: 1490,
                    },
                },
                user: {
                    type: "string",
                    secure: true,
                    optionDefinition: {
                        name: "user",
                        aliases: ["u"],
                        description: "Your username to connect to CICS",
                        type: "string",
                        implies: ["password"],
                        required: true,
                    },
                },
                password: {
                    type: "string",
                    secure: true,
                    optionDefinition: {
                        name: "password",
                        aliases: ["p"],
                        description: "Your password to connect to CICS",
                        type: "string",
                        implies: ["user"],
                        required: true,
                    },
                },
                regionName: {
                    type: "string",
                    optionDefinition: {
                        name: "region-name",
                        description: "The name of the CICS region name to interact with",
                        type: "string"
                    },
                },
                cicsPlex: {
                    type: "string",
                    optionDefinition: {
                        name: "cics-plex",
                        description: "The name of the CICSPlex to interact with",
                        type: "string"
                    },
                },
                rejectUnauthorized: {
                    type: "boolean",
                    optionDefinition: {
                        name: "reject-unauthorized",
                        aliases: ["ru"],
                        description: "Reject self-signed certificates.",
                        type: "boolean",
                        defaultValue: true,
                        required: false,
                        group: "Cics Connection Options"
                    }
                },
                protocol: {
                    type: "string",
                    optionDefinition: {
                        name: "protocol",
                        aliases: ["o"],
                        description: "Specifies CMCI protocol (http or https).",
                        type: "string",
                        defaultValue: "https",
                        required: true,
                        allowableValues: { values: ["http", "https"], caseSensitive: false },
                        group: "Cics Connection Options"
                    }
                }
            },
            required: ["host"],
        },
        createProfileExamples: [
            {
                options: "cics123 --host zos123 --port 1490 --user ibmuser --password myp4ss",
                description: "Create a cics profile named 'cics123' to connect to CICS at host zos123 and port 1490"
            }
        ]
    }
];

export default cicsProfileMeta as ICommandProfileTypeConfiguration[];