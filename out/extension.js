"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const disableProgramCommand_1 = require("./commands/disableProgramCommand");
const removeSessionCommand_1 = require("./commands/removeSessionCommand");
const enableProgramCommand_1 = require("./commands/enableProgramCommand");
const addSessionCommand_1 = require("./commands/addSessionCommand");
const newCopyCommand_1 = require("./commands/newCopyCommand");
const vscode_1 = require("vscode");
const phaseInCommand_1 = require("./commands/phaseInCommand");
const CicsSession_1 = require("./utils/CicsSession");
const showAttributesCommand_1 = require("./commands/showAttributesCommand");
const filterProgramsCommand_1 = require("./commands/filterProgramsCommand");
const profileManagement_1 = require("./utils/profileManagement");
const CICSTree_1 = require("./trees/CICSTree");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        if (profileManagement_1.ProfileManagement.apiDoesExist()) {
            /**
             * This line will change when the profilesCache can take a new profile type to cache on refresh,
             * an addition planned for PI3.
             *
             * - This will also stop profiles leaking into MVS tree
             *
             */
            profileManagement_1.ProfileManagement.getExplorerApis().registerMvsApi(new CicsSession_1.CicsApi());
            /** */
            yield profileManagement_1.ProfileManagement.getExplorerApis().getExplorerExtenderApi().reloadProfiles();
            vscode_1.window.showInformationMessage("Zowe Explorer was modified for the CICS Extension");
        }
        const treeDataProv = new CICSTree_1.CICSTree();
        vscode_1.window
            .createTreeView("cics-view", {
            treeDataProvider: treeDataProv,
            showCollapseAll: true,
        })
            .onDidExpandElement((node) => {
            if (node.element.contextValue.includes("cicssession.")) {
            }
            else if (node.element.contextValue.includes("cicsplex.")) {
            }
            else if (node.element.contextValue.includes("cicsregion.")) {
                // Load region contents
                treeDataProv.loadRegionContents(node.element);
            }
            else if (node.element.contextValue.includes("cicsprogram.")) {
            }
        });
        context.subscriptions.push(addSessionCommand_1.getAddSessionCommand(treeDataProv), 
        // getRefreshCommand(treeDataProv),
        newCopyCommand_1.getNewCopyCommand(treeDataProv), showAttributesCommand_1.getShowAttributesCommand(), phaseInCommand_1.getPhaseInCommand(treeDataProv), showAttributesCommand_1.getShowRegionAttributes(), enableProgramCommand_1.getEnableProgramCommand(treeDataProv), disableProgramCommand_1.getDisableProgramCommand(treeDataProv), removeSessionCommand_1.getRemoveSessionCommand(treeDataProv), filterProgramsCommand_1.getFilterProgramsCommand(treeDataProv));
    });
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map