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

/\*

- This program and the accompanying materials are made available under the terms of the
- Eclipse Public License v2.0 which accompanies this distribution, and is available at
- https://www.eclipse.org/legal/epl-v20.html
-
- SPDX-License-Identifier: EPL-2.0
-
- Copyright Contributors to the Zowe Project.
- \*/

/\*

- This program and the accompanying materials are made available under the terms of the
- Eclipse Public License v2.0 which accompanies this distribution, and is available at
- https://www.eclipse.org/legal/epl-v20.html
-
- SPDX-License-Identifier: EPL-2.0
-
- Copyright Contributors to the Zowe Project.
- \*/

# Zowe Conformance Test Evaluation Guide

The Zowe Conformance Test Evaluation Guide is a set of self-certifying and self-service tests to help the development community integrate and extend specific technology into the Zowe framework.

This guide describes the requirements of the three available conformance programs. Items marked **(required)** are required for an application to be conformant. Items marked **(best practice)** are considered best practices for conformant applications.

These Zowe Conformance criteria are applicable to the lastest Zowe v1 LTS Release.

- [Zowe Conformance Test Evaluation Guide](#zowe-conformance-test-evaluation-guide)
  - [Zowe Explorer for Visual Studio Code - Zowe v1](#zowe-explorer-for-visual-studio-code---zowe-v1)
    - [General Extension](#general-extension)
    - [Extension Accessing Profiles](#extension-accessing-profiles)
    - [Data Provider Extension](#data-provider-extension)
    - [Extension Adding Menus](#extension-adding-menus)

## Zowe Explorer for Visual Studio Code - Zowe v1

Throughout the this Zowe Explorer for Visual Studio Code section you will find the following terminology being used:

- <a id="extender"></a> _Extender_: The organization or developer producing an extension for Zowe Explorer for Visual Studio Code.
- <a id="extension"></a> _Extension of Zowe Explorer for Visual Studio Code_: An installable piece of software that provides new functionality to Zowe Explorer for Visual Studio Code or uses/calls services provided by Zowe Explorer for Visual Studio Code. Also simply referred to here as an "extension", this can be a Visual Studio Code extension as well as a Zowe CLI Plugin or an independent piece of software. The conformance criteria below call out conformance requirements for three common types of extensions of Zowe Explorer for Visual Studio Code, but it is possible that more kinds of extensions can be created. If such new extension kinds surface, then Zowe Explorer for Visual Studio Code APIs and this document can be expanded to support them in the future.
- _Zowe Explorer for Visual Studio Code - Visual Studio Code extension_: Refers to a Zowe Explorer for Visual Studio Code extension that is a Visual Studio Code extension that is installed in addition to Zowe Explorer for Visual Studio Code ad that has a Visual Studio Code extension dependency to Zowe Explorer for Visual Studio Code.
- <a id="zowe-sdk"></a> _Zowe SDKs_ are [SDKs published by the Zowe project](https://docs.zowe.org/stable/user-guide/sdks-using) that provides various APIs for writing Zowe-based capabilities in general.

### General Extension

General conformance criteria for all extensions that add new capabilities to Zowe Explorer for Visual Studio Code.

<table rules="all">
 <thead>
 <th style=background-color:#5555AA>Item </th>
 <th style=background-color:#5555AA>Ver </th>
 <th style=background-color:#5555AA>Required </th>
 <th style=background-color:#5555AA>Best Practice </th>
 <th style=background-color:#5555AA>Conformant </th>
 <th style=background-color:#5555AA>Criteria </th>
 </thead>

 <tr>
   <th style="background-color:#555555">1</th>
   <th style="background-color:#555555">v1</th>
   <th style="background-color:#AAAAAA">x</th>
   <th style="background-color:#AAAAAA"></th>
   <th>Zowe Explorer for IBM CICS</th>
   <td><b>Naming:</b> If the extension uses the word "Zowe" in its name, it abides by The Linux Foundation <a href="https://www.linuxfoundation.org/trademark-usage/">Trademark Usage Guidelines</a> and <a href="https://www.openmainframeproject.org/branding-guidelines">Branding Guidelines</a> to ensure the word Zowe is used in a way intended by the Zowe community.</td>
 </tr>

 <tr>
   <th style="background-color:#555555">2</th>
   <th style="background-color:#555555">v1</th>
   <th style="background-color:#AAAAAA"></th>
   <th style="background-color:#AAAAAA">x</th>
   <th>No installation needed </th>
   <td><b>No Zowe CLI plugin installation requirement: </b> If the <a href="#extender">extender</a> makes use of a Zowe CLI profile other than the Zowe Explorer for Visual Studio Code default `zosmf` then the extension must not make any assumptions that a matching Zowe CLI plugin has been installed in the Zowe Explorer for Visual Studio Code user's environment.</td>
 </tr>

 <tr>
   <th style="background-color:#555555">3</th>
   <th style="background-color:#555555">v1</th>
   <th style="background-color:#AAAAAA">x</th>
   <th style="background-color:#AAAAAA"></th>
   <th>Keyword `Zowe` used</th>
   <td><b>Publication tag:</b> If the extension is published in a public catalog or marketplace such as Npmjs, Open-VSX, or Visual Studio Code Marketplace, it uses the tag or keyword "Zowe" so it can be found when searching for Zowe and be listed with other Zowe offerings.</td>
 </tr>

 <tr>
   <th style="background-color:#555555">4</th>
   <th style="background-color:#555555">v1</th>
   <th style="background-color:#AAAAAA">x</th>
   <th style="background-color:#AAAAAA"></th>
   <th>Included in readme.md section "Providing feedback or help contributing"</th>
   <td><b>Support:</b> Extension has documentation with instructions on how to report problems that are related to the extension and not Zowe Explorer for Visual Studio Code. It needs to explain how users can determine if a problem is related to the extension or Zowe Explorer for Visual Studio Code.</td>
 </tr>

 <tr>
   <th style="background-color:#555555">5</th>
   <th style="background-color:#555555">v1</th>
   <th style="background-color:#AAAAAA"></th>
   <th style="background-color:#AAAAAA">x</th>
   <th>Zowe.CICS used.</th>
   <td><b>User settings consistency:</b> <a href="#extender">Extender</a> provides a consistent user settings experience. For Visual Studio Code extensions, <a href="#extender">extender</a> follows the recommended naming convention for configuration settings as described in Visual Studio Code's <a href="https://code.visualstudio.com/api/references/contribution-points#contributes.configuration">configuration contribution documentation</a>, and avoids starting setting names with the prefix `zowe.`, which is reserved for Zowe Explorer for Visual Studio Code.</td>
 </tr>

 <tr>
   <th style="background-color:#555555">6</th>
   <th style="background-color:#555555">v1</th>
   <th style="background-color:#AAAAAA"></th>
   <th style="background-color:#AAAAAA">x</th>
   <th>Yes</th>
   <td><b>Error message consistency:</b> Extension follows the recommended error message format indicated in the Zowe Explorer for Visual Studio Code extensibility documentation to provide a consistent user experience with Zowe Explorer for Visual Studio Code.</td>
 </tr>

 <tr>
   <th style="background-color:#555555">7</th>
   <th style="background-color:#555555">v1</th>
   <th style="background-color:#AAAAAA"></th>
   <th style="background-color:#AAAAAA">x</th>
   <th>Yes</th>
   <td><b><a href="#zowe-sdk">Zowe SDK</a> usage:</b> Extension utilizes the available <a href="#zowe-sdk">Zowe SDK</a>s that standardize z/OS interactions as well as other common capabilities that are used by many other Zowe extensions and tools unless the extension's goal is to provide a new implementation with clearly stated goals.</td>
 </tr>

 <tr>
   <th style="background-color:#555555">8</th>
   <th style="background-color:#555555">v1</th>
   <th style="background-color:#AAAAAA">x</th>
   <th style="background-color:#AAAAAA"></th>
   <th>Yes, profiles are shared with the Zowe CICS CLI</th>
   <td><b>Sharing of profiles with Zowe CLI:</b> Extensions that utilize Zowe CLI profiles must share the created profile instances between Zowe CLI and the <a href="#extension">Zowe Explorer for Visual Studio Code extension</a> that utilize them.</td>
 </tr>
 <tr>
   <th style="background-color:#555555" rowspan=5>9</th>
   <th style="background-color:#555555"></th>
   <th style="background-color:#AAAAAA" colspan=2>Mark (a) or (b) or (c)</th>
   <th style="background-color:#AAAAAA"></th>
   <td style="text-align:center">Extension uses the extensibility APIs provided by Zowe Explorer for Visual Studio Code. Supported methods include:<p style="color:red">(Please select all that apply _a_, _b_, or _c_)</td>
 </tr>
 <tr>
   <th style="background-color:#555555"></th>
   <th style="background-color:#AAAAAA"></th>
   <th style="background-color:#AAAAAA" ></th>
   <th>Yes</th>
  <td>a. Extension Accessing Profiles</td>
 </tr>
 <tr>
   <th style="background-color:#555555"></th>
   <th style="background-color:#AAAAAA"></th>
   <th style="background-color:#AAAAAA" ></th>
   <th>No</th>
  <td>b. Data Provider Extension</td>
 </tr>
 <tr>
   <th style="background-color:#555555"></th>
   <th style="background-color:#AAAAAA"></th>
   <th style="background-color:#AAAAAA" ></th>
   <th>Yes</th>
  <td>c. Extension Adding Menus</td>
 </tr>
</table>

### Extension Accessing Profiles

Criteria for Visual Studio Code extensions that want to access the same Zowe CLI profiles that Zowe Explorer for Visual Studio Code uses.

<table rules="all">
 <thead>
 <th style=background-color:#5555AA>Item </th>
 <th style=background-color:#5555AA>Ver </th>
 <th style=background-color:#5555AA>Required </th>
 <th style=background-color:#5555AA>Best Practice </th>
 <th style=background-color:#5555AA>Conformant </th>
 <th style=background-color:#5555AA>Criteria </th>
 </thead>

 <tr>
   <th style="background-color:#555555">10</th>
   <th style="background-color:#555555">v1</th>
   <th style="background-color:#AAAAAA">x</th>
   <th style="background-color:#AAAAAA"></th>
   <th>Yes</th>
   <td><b>Visual Studio Code extension dependency:</b> Extension declares Zowe Explorer for Visual Studio Code as a Visual Studio Code extension dependency by including an `extensionDependencies` entry for Zowe Explorer for Visual Studio Code in its package.json file.</td>
 </tr>

  <tr>
   <th style="background-color:#555555">11</th>
   <th style="background-color:#555555">v1</th>
   <th style="background-color:#AAAAAA">x</th>
   <th style="background-color:#AAAAAA"></th>
   <th>Yes</th>
   <td><b>Zowe <a href="#extender">Extender</a> access:</b> Extension accesses the shared Zowe Explorer for Visual Studio Code profiles cache via `ZoweExplorerApi.IApiRegisterClient.getExplorerExtenderApi()` API as documented in the Zowe Explorer for Visual Studio Code extensibility documentation.</td>
 </tr>

  <tr>
   <th style="background-color:#555555">12</th>
   <th style="background-color:#555555">v1</th>
   <th style="background-color:#AAAAAA">x</th>
   <th style="background-color:#AAAAAA"></th>
   <th>Yes</th>
   <td><b>Added Profile Type initialization:</b> If the extension has a dependency on a new Zowe CLI profile type other than the Zowe Explorer for Visual Studio Code default `zosmf`, it is calling the `ZoweExplorerApi.IApiRegisterClient.getExplorerExtenderApi().initialize(profileTypeName)` to ensure that the profile type is supported and managed by the extension without a Zowe CLI plugin installed.</td>
 </tr>
</table>

### Data Provider Extension

Criteria for Visual Studio Code extensions that extend the Zowe Explorer for Visual Studio Code MVS, USS, or JES tree views to use alternative z/OS interaction protocols such as FTP or a REST API.

<table rules="all">
 <thead>
 <th style=background-color:#5555AA>Item </th>
 <th style=background-color:#5555AA>Ver </th>
 <th style=background-color:#5555AA>Required </th>
 <th style=background-color:#5555AA>Best Practice </th>
 <th style=background-color:#5555AA>Conformant </th>
 <th style=background-color:#5555AA>Criteria </th>
 </thead>

 <tr>
   <th style="background-color:#555555">13</th>
   <th style="background-color:#555555">v1</th>
   <th style="background-color:#AAAAAA">x</th>
   <th style="background-color:#AAAAAA"></th>
   <th>N/A</th>
   <td><b>New Zowe CLI profile type:</b> Extension registers its new API instances with a new profile type name for the different Zowe Explorer for Visual Studio Code views via the `ZoweExplorerApi.IApiRegisterClient.register{Mvs|Uss|Jes}Api(profileTypeName)` call as indicated from the Zowe Explorer for Visual Studio Code extensibility documentation</td>
 </tr>

 <tr>
   <th style="background-color:#555555">14</th>
   <th style="background-color:#555555">v1</th>
   <th style="background-color:#AAAAAA"></th>
   <th style="background-color:#AAAAAA">x</th>
   <th>N/A</th>
   <td><b>Matching Zowe CLI Plugin:</b> Provide a Zowe CLI Plugin for the data provider's new profile type that implements the core capabilities required for the new protocol that users can then also use to interact with the protocol outside of the <a href="#extension">Zowe Explorer for Visual Studio Code extension</a> using Zowe CLI commands.</td>
 </tr>

 <tr>
   <th style="background-color:#555555">15</th>
   <th style="background-color:#555555">v1</th>
   <th style="background-color:#AAAAAA">x</th>
   <th style="background-color:#AAAAAA"></th>
   <th>N/A</th>
   <td><b>Data provider API implementation:</b> Extension fully implements and registers to at least one of the three Zowe Explorer for Visual Studio Code interfaces or alternatively throw exceptions that provide meaningful error messages to the end-user in the 'Error.message' property that will be displayed in a dialog.</td>
 </tr>

 <tr>
   <th style="background-color:#555555">16</th>
   <th style="background-color:#555555">v1</th>
   <th style="background-color:#AAAAAA"></th>
   <th style="background-color:#AAAAAA">x</th>
   <th>N/A</th>
   <td><b>API test suite implementation:</b>  If the extension implements a Zowe Explorer for Visual Studio Code API data provider interface, it should implement a test suite that calls each of the implemented API methods.</td>
 </tr>

 <tr>
   <th style="background-color:#555555">17</th>
   <th style="background-color:#555555">v1</th>
   <th style="background-color:#AAAAAA"></th>
   <th style="background-color:#AAAAAA">x</th>
   <th>N/A</th>
   <td><b>Base Profile and Tokens:</b> Extension supports base profiles and tokens.</td>
 </tr>

 <tr>
   <th style="background-color:#555555">18</th>
   <th style="background-color:#555555">v1</th>
   <th style="background-color:#AAAAAA"></th>
   <th style="background-color:#AAAAAA">x</th>
   <th>N/A</th>
   <td><b>Team Configuration File:</b> Extension supports the Zowe CLI 7 team configuration file format as an alternative to the Zowe CLI 6 profiles file format.</td>
 </tr>

 <tr>
   <th style="background-color:#555555">19</th>
   <th style="background-color:#555555">v1</th>
   <th style="background-color:#AAAAAA"></th>
   <th style="background-color:#AAAAAA">x</th>
   <th>N/A</th>
   <td><b>Secure Credential Store:</b> If the extension supports Zowe CLI's Secure Credential store, it calls the Zowe Explorer for Visual Studio Code-provided method for initialization at startup.</td>
 </tr>
</table>

### Extension Adding Menus

Criteria for Visual Studio Code extensions adding menu and commands to Visual Studio Code that utilize Zowe Explorer for Visual Studio Code data or extend Zowe Explorer for Visual Studio Code capabilities.

<table rules="all">
 <thead>
 <th style=background-color:#5555AA>Item </th>
 <th style=background-color:#5555AA>Ver </th>
 <th style=background-color:#5555AA>Required </th>
 <th style=background-color:#5555AA>Best Practice </th>
 <th style=background-color:#5555AA>Conformant </th>
 <th style=background-color:#5555AA>Criteria </th>
 </thead>

 <tr>
   <th style="background-color:#555555">20</th>
   <th style="background-color:#555555">v1</th>
   <th style="background-color:#AAAAAA">x</th>
   <th style="background-color:#AAAAAA"></th>
   <th>N/A</th>
   <td><b>Command operations: </b> If the extension is adding new commands to Zowe Explorer for Visual Studio Code's tree views, the commands must not replace any existing Zowe Explorer for Visual Studio Code commands.</td>
 </tr>

  <tr>
   <th style="background-color:#555555">21</th>
   <th style="background-color:#555555">v1</th>
   <th style="background-color:#AAAAAA">x</th>
   <th style="background-color:#AAAAAA"></th>
   <th>Yes</th>
   <td><b>Command categories: </b>  If the extension adds to <code>contributes.commands</code> in <code>package.json</code>, the value assigned to the <code>category</code> property contains the extension name and it cannot be "Zowe Explorer for Visual Studio Code".</td>
 </tr>

  <tr>
   <th style="background-color:#555555">22</th>
   <th style="background-color:#555555">v1</th>
   <th style="background-color:#AAAAAA">x</th>
   <th style="background-color:#AAAAAA"></th>
   <th>N/A</th>
   <td><b>Context menu groups: </b> If contributing commands to Zowe Explorer for Visual Studio Code's context menus, the extension follows the Zowe Explorer for Visual Studio Code extensibility documentation and adds them in new context menu groups that are located below Zowe Explorer for Visual Studio Code's existing context menu groups in the user interface.</td>
 </tr>

  <tr>
   <th style="background-color:#555555">23</th>
   <th style="background-color:#555555">v1</th>
   <th style="background-color:#AAAAAA"></th>
   <th style="background-color:#AAAAAA">x</th>
   <th>N/A</th>
   <td><b>Menu Names:</b> If the extension is adding new commands and context menu entries to the Zowe Explorer for Visual Studio Code tree view nodes, the new command name is consistent with the terminology and naming conventions of the existing Zowe Explorer for Visual Studio Code menu entries.</td>
 </tr>

 <tr>
   <th style="background-color:#555555">24</th>
   <th style="background-color:#555555">v1</th>
   <th style="background-color:#AAAAAA"></th>
   <th style="background-color:#AAAAAA">x</th>
   <th>N/A</th>
   <td><b>Context menu items: </b> If contributing commands to Zowe Explorer for Visual Studio Code's views (such as Data Sets, USS, or Jobs), the extension should only add them to the view's right-click context menus.</td>
 </tr>
</table>
