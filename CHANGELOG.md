# Change Log

All notable changes to the "cics-extension-for-zowe" extension will be documented in this file.

## `1.0.0`

- Included interaction with the Zowe Explorer APIs to be able to retrieve and manipulate Zowe CICS Profiles.
- Ability to update existing Zowe CICS Profiles as well as create new ones with a GUI.
- Added persistent filtering, allowing a user to select previously used filters from a drop-down, or to create new ones.
- Added support for wildcards in the filtering to be consistent with the core Zowe Explorer.
- Added new CICS resource types, including Local Transactions and Local Files as well as the already included Programs.
- Added filtering across a whole plex to search for all instances of a Program, Transaction or File.
- Added the ability to run a command across multiple Programs, Transactions or Files by selecting them and running the command.
- Included auto-reading of CICS Plexes and Regions if not specified in your Zowe profile.
- Inluded compatibility with Theia, allowing for web-based use-cases of this extension.
- Prevention of CICS Profiles leaking into the other Zowe Explorer trees.
