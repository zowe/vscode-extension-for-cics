# Zowe CICS Explorer

[![version](https://vsmarketplacebadge.apphb.com/version-short/zowe.zowe-explorer-cics-extension.svg)](https://vsmarketplacebadge.apphb.com/version-short/Zowe.cics-extension-for-zowe.svg)
[![downloads](https://vsmarketplacebadge.apphb.com/downloads-short/zowe.zowe-explorer-cics-extension.svg)](https://vsmarketplacebadge.apphb.com/downloads-short/Zowe.cics-extension-for-zowe.svg)
[![slack](https://img.shields.io/badge/chat-on%20Slack-blue)](https://openmainframeproject.slack.com/archives/CUVE37Z5F)
[![open issues](https://img.shields.io/github/issues/zowe/vscode-extension-for-cics)](https://github.com/zowe/vscode-extension-for-cics/issues)


This CICS Extension for Zowe Explorer adds additional functionality to the popular VSCode extension, [Zowe Explorer](https://github.com/zowe/vscode-extension-for-zowe). This extension allows interactions with CICS regions and programs, and the ability to run commands against them.

## Features

- Load profiles directly from Zowe instance locally installed.
- Create new Zowe CICS profiles and connect to them.
- View multiple regions and programs within a plex in a comprehensible tree-like format .
- Perform actions such as `New Copy` and `Phase In` directly from the UI
- View attributes about the programs and regions by right-clicking

To Install CICS Extension for Zowe Explorer see [Installation](./docs/installation-guide.md)

## Getting Started

### Create Profile

If you already have a Zowe CICS CLI profile the CICS tree will load this on startup.  

If you don't have an existing CICS profile add one by selecting the + button in the CICS tree and choosing the option `Create New Session ...` to open a panel allowing connection details to be defined.  The connection must point to a CICS region's CICS Management Client Interface (CMCI) TCP/IP host name and port number.  The region can be a WUI server in a CICSPlex, or else a stand-alone Single Management Application Programming (SMSS) region. 

To show more than one CICS profile in the tree, select the + button and choose from the list of profiles.  Only profiles not already included in the CICS tree will be shown.  To view all Zowe CICS CLI profiles use the command `zowe profiles list cics` from a terminal. 

<p align="center">
<img src="./docs/images/create-profile.gif" alt="Zowe CICS Explorer profiles" width="700px"/> 
</p>

Expand a CICS profile to see the region name, and expand the region to view its programs.  If the CICS profile is connected to a CMAS region that is part of a CICSPlex, the tree will show all of the regions managed by the CICSPlex.  If the CICS profile is for an SMSS region then just one region will be shown.  

### Show and filter resources

Expand a CICS region to show folders for the resource types `Programs` <img src="./docs/images/resource-type-programs.png" width="16px"/>  , `Transactions` <img src="./docs/images/resource-type-transactions.png" width="16px"/> and `Local Files` <img src="./docs/images/resource-type-local-files.png" width="16px"/>.  Expand each type to show the resources.

The list of resources are pre-filtered to exclude many of the IBM supplied ones to narrow the contents to just include user programs.  Use the search icon <img src="./docs/images/resource-filter.png" width="16px"/>  against a resource type to apply a filter.  This can be an exact resource name or else you can use wildcards.  The search history is saved so you can recall previous searches.  To reset the filter to its initial criteria use the clear filter icon <img src="./docs/images/resource-filter-clear.png" width="16px"/> against the resource type.  If you wish to see all resources in a region (including IBM supplied ones) you can use "*" as a filter.

<p align="center">
<img src="./docs/images/filter.gif" alt="Zowe CICS Explorer Filter" width="700px"/> 
</p>

### Show Attributes

Use the pop-up menu against a program to list the available actions that can be performed. For every resource, including a CICS region `Show Attributes` opens a viewer listing all attributes and their values.  The attributes page has a filter box at the top that lets you search for attributes matching the criteria.  

The menu for Program in addition has the actions `Disable Program`, `NewCopy` and `PhaseIn` .  When a program is already disabled the first option becomes `Enable Program` to allow its enabement state to be toggled.  

Use `New Copy` <img src="./docs/images/program-newcopy-action.png" width="16px"/> and `Phase In` <img src="./docs/images/program-phasein-action.png" width="16px"/> actions to get the CICS region to load a fresh of the selected program into memory. This could be after you've edited a COBOL program source and successfully compiled it into a load library and now want to test your change.  Both actions can be performed on more than one program using multi-select.  

<p align="center">
<img src="./docs/images/program-newcopy.gif" alt="Zowe CICS Explorer NewCopy Program" width="600px"/> 
</p>

Following a `New Copy` or `Phase In` the updated value of the `newcopycnt` attribute is retrieved after the action and shown as a pop-up informational message.  The `newcopycnt` for a program which is greater than zero is shown next to the program item in the CICS resource tree.

## Release Notes

<!-- Major refactor from initial release. New UI features like icons and an updated tree view. Increased functionality with new and improved commands.  Local Files and Local Transactions added to the resource tree. -->

---
