# Change Log

All notable changes to the "cics-extension-for-zowe" extension will be documented in this file.

## `2.1.0`
- Added a the ability to view CICS Tasks [#224](https://github.com/zowe/vscode-extension-for-cics/pull/224).
- Added right-click menu action to reveal the associated program from a transaction [#240](https://github.com/zowe/vscode-extension-for-cics/pull/240).
- Added right-click menu action to reveal the associated transaction from a task [#246](https://github.com/zowe/vscode-extension-for-cics/issues/246).
- Added the ability to change the default 500 record count incremenet number via Settings (UI) [#242](https://github.com/zowe/vscode-extension-for-cics/pull/242).
- Fixed the issue which prevented lowercase strings being used for local file filter [#231](https://github.com/zowe/vscode-extension-for-cics/pull/231).
- Fixed the issue where a right-click `Show Attributes` command incorrectly appears on a `Regions` container [#237](https://github.com/zowe/vscode-extension-for-cics/pull/237).
- Fixed the issue which left previosuly expanded profiles expanded after refresh of cics view [#244](https://github.com/zowe/vscode-extension-for-cics/issues/244).
- Updated the troubleshooting guide with a V2 schema error [#241](https://github.com/zowe/vscode-extension-for-cics/pull/241).
- Updated the `Show Attributes` table to resize column width to fit into the view [#234](https://github.com/zowe/vscode-extension-for-cics/pull/234).
- Updated the `Show Attributes` table to consistently show uppercase values for headings [#239](https://github.com/zowe/vscode-extension-for-cics/pull/239).
- Adding the 'Show SIT Attribute' option for Regions and Added filter on Name and Source Columns [#277](https://github.com/zowe/vscode-extension-for-cics/pull/277).
- Renamed 'Reveal Tansaction' and 'Reveal Program' to 'Inquire Tansaction' and 'Inquire Program'[#281](https://github.com/zowe/vscode-extension-for-cics/pull/281).

## `2.0.0`
- **Major**: Introduced the ability to access Team Profiles.
- Added v1 backwards compatibility [#180](https://github.com/zowe/vscode-extension-for-cics/pull/180) & [#212](https://github.com/zowe/vscode-extension-for-cics/pull/212).
- Added error message on activation if compatible Zowe Explorer extension is not found [#162](https://github.com/zowe/vscode-extension-for-cics/issues/162).
- Added ability to open the config file to add a new CICS profile [#157](https://github.com/zowe/vscode-extension-for-cics/issues/157).
- Added ability to open the config file to update a CICS profile [#150](https://github.com/zowe/vscode-extension-for-cics/issues/150).
- Fixed build script to work on Windows [#160](https://github.com/zowe/vscode-extension-for-cics/issues/160).
- Added a progress bar and fixed the refresh command [#210](https://github.com/zowe/vscode-extension-for-cics/issues/210).

## `1.3.0`
- Added the option to specify CICS System Groups instead of a region name when creating a profile [#146](https://github.com/zowe/vscode-extension-for-cics/pull/146).
- Added new icons for CICS System Groups and improved existing CICS Plex icon[#154](https://github.com/zowe/vscode-extension-for-cics/pull/154)
- Fixed all command palette actions to work with their associated resource [#151](https://github.com/zowe/vscode-extension-for-cics/pull/151).
- Added progress bar to indicate the loading of resources when filtering [#152](https://github.com/zowe/vscode-extension-for-cics/pull/152).
- Updated the filtering prompts to be consistent with Zowe Explorer [#149](https://github.com/zowe/vscode-extension-for-cics/pull/149). 
## `1.2.0`
- Updated tree nodes to lazily load contents so that resources are only fetched when necessary [#124](https://github.com/zowe/vscode-extension-for-cics/issues/124).
- Added 'All Programs', 'All Local Transactions' and 'All Local Files' trees to show all resources under a plex [#138](https://github.com/zowe/vscode-extension-for-cics/pull/138).
- Limited the number of resources shown in the 'All' trees at one time and included a 'View X more...' item to fetch more data [#138](https://github.com/zowe/vscode-extension-for-cics/pull/138).
- Fixed bug which resulted in duplicate occurrences of plexes.
- Added a resource count for programs, local transactions and local files and a region count [#117](https://github.com/zowe/vscode-extension-for-cics/issues/117).
- Grouped regions together in a new 'Regions' tree [#142](https://github.com/zowe/vscode-extension-for-cics/pull/142)
- Added progress bar to indicate the loading of resources [#118](https://github.com/zowe/vscode-extension-for-cics/issues/118)
- Improved error messages.
- Updated resource icons.
## `1.1.1`
- Fixed the bug that cause z/OSMF profiles with untrusted CA to be invalidated [#116](https://github.com/zowe/vscode-extension-for-cics/issues/116).
- Added 'Zowe Explorer for IBM CICS' in `category` section of the `contributes.commands` section in `package.json` for Zowe Explorer conformance.
- Updated README.md file with 'Providing feedback or help contributing' chapter for Zowe Explorer conformance.
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
