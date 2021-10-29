# Change Log

All notable changes to the "cics-extension-for-zowe" extension will be documented in this file.

## `1.1.0`

- Added new icons for unverified, connected and disconnected profiles.
- Redesigned all profiles to load onto screen and retrieve content only when expanded.
- Redesigned the 'Create CICS Profile' and 'Update CICS Profile' webview forms.
- Removed the need for the 'Reject Unauthorized' field if the protocol selected is 'HTTPS'.
- Added the ability to autofill the 'Profile Name' section of the 'Create CICS Profile' form whn typing into the autofocused 'Host URL' field.
- Added the option to allow users to accept untrusted certificates for connections [#103](https://github.com/zowe/vscode-extension-for-cics/issues/103).
- Added the option to filter regions in a plex, similar to how resources can be filtered [#111](https://github.com/zowe/vscode-extension-for-cics/issues/111).
- Added error messages for invalid profiles that would not load[#99](https://github.com/zowe/vscode-extension-for-cics/issues/99).

## `1.0.2`

- Added 'Enable' and 'Disable' functionality for Transactions [#88](https://github.com/zowe/vscode-extension-for-cics/issues/88).
- Added 'Enable' and 'Disable' functionality for Local Files [#90](https://github.com/zowe/vscode-extension-for-cics/issues/90).
- Added 'Open' and 'Close' functionality for Local Files [#91](https://github.com/zowe/vscode-extension-for-cics/issues/91).
- Added error messages for failed commands such as phase-in and newcopy [#89](https://github.com/zowe/vscode-extension-for-cics/issues/89).
- Fixed the issue where updating the topmost profile caused it to disappear [#93](https://github.com/zowe/vscode-extension-for-cics/issues/93).
- Improved the filtering to allow multiple filters using a comma-separated input [#95](https://github.com/zowe/vscode-extension-for-cics/issues/95).
- Added the option to choose how to proceed if the local file is busy when a disable command is executed [#97](https://github.com/zowe/vscode-extension-for-cics/issues/97).
- Fixed the issue of error messages not appearing on theia [#98](https://github.com/zowe/vscode-extension-for-cics/issues/98).
- Fixed the issue of not being able to execute a sequence of commands without collapsing and re-expanding the region tree [#102](https://github.com/zowe/vscode-extension-for-cics/issues/102).
- Added a cancellable progress bar to indicate the loading of profiles [#104](https://github.com/zowe/vscode-extension-for-cics/issues/104).
- Improved 'Show Attributes' webview by reducing the whitespace, adding a sticky search bar and renaming the title to be more beneficial for users.
- Further improved compatibility with theia by making resource commands and filtering work.

## `1.0.1`
- Fixed the bug that prevented enable/disable status changing on the program label.
- Updated documentation.
- Updated graphics.

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
