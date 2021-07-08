# CICS Extension Installation

## Requirements

- VSSode
- Zowe Explorer (optional - the Zowe Explorer will be added as part of the install if it isn't already present in VSCode.

## Installation

### From VSIX File 

1. Download [cics-extension-for-zowe-0.0.1.vsix](https://github.com/zowe/vscode-extension-for-cics/raw/main/cics-extension-for-zowe-0.0.1.vsix) to your PC that has VS Code already installed.

2. Open the Extensions icon in the side bar, navigate to the ... menu, press **Install from VSIX ...** and select the downloaded `cics-extension-for-zowe-0.0.1.vsix` file.

<img src="./images/zowe-cics-explorer-install.gif" alt="Installing Zowe CICS Explorer" width="700px"/> 

3. After installation

The successfull install message should be shown

<img src="./images/info-message-install-completed.png" alt="Zowe CICS Explorer install completed" width="700px"/> 


The Zowe Explorer pane will still show tree views for `Data Sets`, `Unit System Services (USS)` and `Jobs`, but in addition a new view `CICS` will be included.
