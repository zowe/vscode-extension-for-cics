# Zowe Explorer for IBM CICS extension Troubleshooting

Check that the [source of the error](https://github.com/zowe/vscode-extension-for-cics#checking-the-source-of-an-error) is from the Zowe Explorer for IBM CICS extension before refering to the troubleshooting documentation.

## Contents

- ['Socket is closed' error](#socket-is-closed-error)
- ['Failed to load schema for profile type cics' error](#failed-to-load-schema-for-profile-type-cics-error)

## `Socket is closed` error

If a socket closed error occurs when trying to connect to a profile with an IP address for the hostname, try switching to the DNS name for the CICS CMCI connection instead.

## `Failed to load schema for profile type cics` error

This Zowe V2 error appears when a cics profile entry is missing from the `zowe.schema.json` file. Currently, the installation of the Zowe Explorer for IBM CICS extension does not automatically add this cics entry. This is being worked on.

There are 2 ways of adding the cics entry to the schema file and getting around this error message:

1. ### Install Zowe CLI CICS plugin (Preferred)

   Install the Zowe CLI CICS plugin by running `zowe plugins install @zowe/cics-for-zowe-cli` after setting up a Team configuration file via the CLI. This will automatically add the cics profile metadata to the schema file.

2. ### Manually update schema file (NOT recommended)

   Manually update the schema file with CICS metadata.

   An example schema is provided below for a setup containing "zosmf", "tso", "ssh", "cics" and "base" profile type entries:

   ```
   {
       "$schema": "https://json-schema.org/draft/2020-12/schema",
       "$version": "1.0",
       "type": "object",
       "description": "Zowe configuration",
       "properties": {
           "profiles": {
               "type": "object",
               "description": "Mapping of profile names to profile configurations",
               "patternProperties": {
                   "^\\S*$": {
                       "type": "object",
                       "description": "Profile configuration object",
                       "properties": {
                           "type": {
                               "description": "Profile type",
                               "type": "string",
                               "enum": [
                                   "zosmf",
                                   "tso",
                                   "ssh",
                                   "cics",
                                   "base"
                               ]
                           },
                           "properties": {
                               "description": "Profile properties object",
                               "type": "object"
                           },
                           "profiles": {
                               "description": "Optional subprofile configurations",
                               "type": "object",
                               "$ref": "#/properties/profiles"
                           },
                           "secure": {
                               "description": "Secure property names",
                               "type": "array",
                               "items": {
                                   "type": "string"
                               },
                               "uniqueItems": true
                           }
                       },
                       "allOf": [
                           {
                               "if": {
                                   "properties": {
                                       "type": false
                                   }
                               },
                               "then": {
                                   "properties": {
                                       "properties": {
                                           "title": "Missing profile type"
                                       }
                                   }
                               }
                           },
                           {
                               "if": {
                                   "properties": {
                                       "type": {
                                           "const": "zosmf"
                                       }
                                   }
                               },
                               "then": {
                                   "properties": {
                                       "properties": {
                                           "type": "object",
                                           "title": "z/OSMF Profile",
                                           "description": "z/OSMF Profile",
                                           "properties": {
                                               "host": {
                                                   "type": "string",
                                                   "description": "The z/OSMF server host name."
                                               },
                                               "port": {
                                                   "type": "number",
                                                   "description": "The z/OSMF server port.",
                                                   "default": 443
                                               },
                                               "user": {
                                                   "type": "string",
                                                   "description": "Mainframe (z/OSMF) user name, which can be the same as your TSO login."
                                               },
                                               "password": {
                                                   "type": "string",
                                                   "description": "Mainframe (z/OSMF) password, which can be the same as your TSO password."
                                               },
                                               "rejectUnauthorized": {
                                                   "type": "boolean",
                                                   "description": "Reject self-signed certificates.",
                                                   "default": true
                                               },
                                               "certFile": {
                                                   "type": "string",
                                                   "description": "The file path to a certificate file to use for authentication"
                                               },
                                               "certKeyFile": {
                                                   "type": "string",
                                                   "description": "The file path to a certificate key file to use for authentication"
                                               },
                                               "basePath": {
                                                   "type": "string",
                                                   "description": "The base path for your API mediation layer instance. Specify this option to prepend the base path to all z/OSMF resources when making REST requests. Do not specify this option if you are not using an API mediation layer."
                                               },
                                               "protocol": {
                                                   "type": "string",
                                                   "description": "The protocol used (HTTP or HTTPS)",
                                                   "default": "https",
                                                   "enum": [
                                                       "http",
                                                       "https"
                                                   ]
                                               },
                                               "encoding": {
                                                   "type": "string",
                                                   "description": "The encoding for download and upload of z/OS data set and USS files. The default encoding if not specified is IBM-1047."
                                               },
                                               "responseTimeout": {
                                                   "type": "number",
                                                   "description": "The maximum amount of time in seconds the z/OSMF Files TSO servlet should run before returning a response. Any request exceeding this amount of time will be terminated and return an error. Allowed values: 5 - 600"
                                               }
                                           },
                                           "required": []
                                       },
                                       "secure": {
                                           "items": {
                                               "enum": [
                                                   "user",
                                                   "password"
                                               ]
                                           }
                                       }
                                   }
                               }
                           },
                           {
                               "if": {
                                   "properties": {
                                       "type": {
                                           "const": "tso"
                                       }
                                   }
                               },
                               "then": {
                                   "properties": {
                                       "properties": {
                                           "type": "object",
                                           "title": "TSO Profile",
                                           "description": "z/OS TSO/E User Profile",
                                           "properties": {
                                               "account": {
                                                   "type": "string",
                                                   "description": "Your z/OS TSO/E accounting information."
                                               },
                                               "characterSet": {
                                                   "type": "string",
                                                   "description": "Character set for address space to convert messages and responses from UTF-8 to EBCDIC.",
                                                   "default": "697"
                                               },
                                               "codePage": {
                                                   "type": "string",
                                                   "description": "Codepage value for TSO/E address space to convert messages and responses from UTF-8 to EBCDIC.",
                                                   "default": "1047"
                                               },
                                               "columns": {
                                                   "type": "number",
                                                   "description": "The number of columns on a screen.",
                                                   "default": 80
                                               },
                                               "logonProcedure": {
                                                   "type": "string",
                                                   "description": "The logon procedure to use when creating TSO procedures on your behalf.",
                                                   "default": "IZUFPROC"
                                               },
                                               "regionSize": {
                                                   "type": "number",
                                                   "description": "Region size for the TSO/E address space.",
                                                   "default": 4096
                                               },
                                               "rows": {
                                                   "type": "number",
                                                   "description": "The number of rows on a screen.",
                                                   "default": 24
                                               }
                                           },
                                           "required": []
                                       }
                                   }
                               }
                           },
                           {
                               "if": {
                                   "properties": {
                                       "type": {
                                           "const": "ssh"
                                       }
                                   }
                               },
                               "then": {
                                   "properties": {
                                       "properties": {
                                           "type": "object",
                                           "title": "z/OS SSH Profile",
                                           "description": "z/OS SSH Profile",
                                           "properties": {
                                               "host": {
                                                   "type": "string",
                                                   "description": "The z/OS SSH server host name."
                                               },
                                               "port": {
                                                   "type": "number",
                                                   "description": "The z/OS SSH server port.",
                                                   "default": 22
                                               },
                                               "user": {
                                                   "type": "string",
                                                   "description": "Mainframe user name, which can be the same as your TSO login."
                                               },
                                               "password": {
                                                   "type": "string",
                                                   "description": "Mainframe password, which can be the same as your TSO password."
                                               },
                                               "privateKey": {
                                                   "type": "string",
                                                   "description": "Path to a file containing your private key, that must match a public key stored in the server for authentication"
                                               },
                                               "keyPassphrase": {
                                                   "type": "string",
                                                   "description": "Private key passphrase, which unlocks the private key."
                                               },
                                               "handshakeTimeout": {
                                                   "type": "number",
                                                   "description": "How long in milliseconds to wait for the SSH handshake to complete."
                                               }
                                           },
                                           "required": []
                                       },
                                       "secure": {
                                           "items": {
                                               "enum": [
                                                   "user",
                                                   "password",
                                                   "keyPassphrase"
                                               ]
                                           }
                                       }
                                   }
                               }
                           },
                           {
                               "if": {
                                   "properties": {
                                       "type": {
                                           "const": "cics"
                                       }
                                   }
                               },
                               "then": {
                                   "properties": {
                                       "properties": {
                                           "type": "object",
                                           "title": "CICS Profile",
                                           "description": "A cics profile is required to issue commands in the cics command group that interact with CICS regions. The cics profile contains your host, port, user name, and password for the IBM CICS management client interface (CMCI) server of your choice.",
                                           "properties": {
                                               "host": {
                                                   "type": "string",
                                                   "description": "The CMCI server host name"
                                               },
                                               "port": {
                                                   "type": "number",
                                                   "description": "The CMCI server port",
                                                   "default": 1490
                                               },
                                               "user": {
                                                   "type": "string",
                                                   "description": "Your username to connect to CICS"
                                               },
                                               "password": {
                                                   "type": "string",
                                                   "description": "Your password to connect to CICS"
                                               },
                                               "regionName": {
                                                   "type": "string",
                                                   "description": "The name of the CICS region name to interact with"
                                               },
                                               "cicsPlex": {
                                                   "type": "string",
                                                   "description": "The name of the CICSPlex to interact with"
                                               },
                                               "rejectUnauthorized": {
                                                   "type": "boolean",
                                                   "description": "Reject self-signed certificates.",
                                                   "default": true
                                               },
                                               "protocol": {
                                                   "type": "string",
                                                   "description": "Specifies CMCI protocol (http or https).",
                                                   "default": "https",
                                                   "enum": [
                                                       "http",
                                                       "https"
                                                   ]
                                               }
                                           },
                                           "required": []
                                       },
                                       "secure": {
                                           "items": {
                                               "enum": [
                                                   "user",
                                                   "password"
                                               ]
                                           }
                                       }
                                   }
                               }
                           },
                           {
                               "if": {
                                   "properties": {
                                       "type": {
                                           "const": "base"
                                       }
                                   }
                               },
                               "then": {
                                   "properties": {
                                       "properties": {
                                           "type": "object",
                                           "title": "Base Profile",
                                           "description": "Base profile that stores values shared by multiple service profiles",
                                           "properties": {
                                               "host": {
                                                   "type": "string",
                                                   "description": "Host name of service on the mainframe."
                                               },
                                               "port": {
                                                   "type": "number",
                                                   "description": "Port number of service on the mainframe."
                                               },
                                               "user": {
                                                   "type": "string",
                                                   "description": "User name to authenticate to service on the mainframe."
                                               },
                                               "password": {
                                                   "type": "string",
                                                   "description": "Password to authenticate to service on the mainframe."
                                               },
                                               "rejectUnauthorized": {
                                                   "type": "boolean",
                                                   "description": "Reject self-signed certificates.",
                                                   "default": true
                                               },
                                               "tokenType": {
                                                   "type": "string",
                                                   "description": "The type of token to get and use for the API. Omit this option to use the default token type, which is provided by 'zowe auth login'."
                                               },
                                               "tokenValue": {
                                                   "type": "string",
                                                   "description": "The value of the token to pass to the API."
                                               },
                                               "certFile": {
                                                   "type": "string",
                                                   "description": "The file path to a certificate file to use for authentication"
                                               },
                                               "certKeyFile": {
                                                   "type": "string",
                                                   "description": "The file path to a certificate key file to use for authentication"
                                               }
                                           },
                                           "required": []
                                       },
                                       "secure": {
                                           "items": {
                                               "enum": [
                                                   "user",
                                                   "password",
                                                   "tokenValue"
                                               ]
                                           }
                                       }
                                   }
                               }
                           }
                       ]
                   }
               }
           },
           "defaults": {
               "type": "object",
               "description": "Mapping of profile types to default profile names",
               "properties": {
                   "zosmf": {
                       "description": "Default zosmf profile",
                       "type": "string"
                   },
                   "tso": {
                       "description": "Default tso profile",
                       "type": "string"
                   },
                   "ssh": {
                       "description": "Default ssh profile",
                       "type": "string"
                   },
                   "cics": {
                       "description": "Default cics profile",
                       "type": "string"
                   },
                   "base": {
                       "description": "Default base profile",
                       "type": "string"
                   }
               }
           },
           "autoStore": {
               "type": "boolean",
               "description": "If true, values you enter when prompted are stored for future use"
           }
       }
   }
   ```
