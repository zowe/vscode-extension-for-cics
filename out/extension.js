"use strict";
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
const zowe_explorer_api_1 = require("@zowe/zowe-explorer-api");
const addSessionCommand_1 = require("./commands/addSessionCommand");
const profileManagement_1 = require("./utils/profileManagement");
const newCopyCommand_1 = require("./commands/newCopyCommand");
const refreshCommand_1 = require("./commands/refreshCommand");
const vscode_1 = require("vscode");
const phaseInCommand_1 = require("./commands/phaseInCommand");
const treeProvider_1 = require("./trees/treeProvider");
const profileStorage_1 = require("./utils/profileStorage");
const CicsSession_1 = require("./utils/CicsSession");
const imperative_1 = require("@zowe/imperative");
const showAttributesCommand_1 = require("./commands/showAttributesCommand");
const filterProgramsCommand_1 = require("./commands/filterProgramsCommand");
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const treeDataProv = new treeProvider_1.CICSTreeDataProvider();
        vscode_1.window
            .createTreeView("cics-view", {
            treeDataProvider: treeDataProv,
            showCollapseAll: true,
        })
            .onDidExpandElement((node) => {
            if (node.element.session) {
            }
            else if (node.element.region) {
                treeDataProv.loadPrograms(node.element);
            }
        });
        context.subscriptions.push(addSessionCommand_1.getAddSessionCommand(treeDataProv), refreshCommand_1.getRefreshCommand(treeDataProv), newCopyCommand_1.getNewCopyCommand(treeDataProv), showAttributesCommand_1.getShowAttributesCommand(), phaseInCommand_1.getPhaseInCommand(treeDataProv), showAttributesCommand_1.getShowRegionAttributes(), enableProgramCommand_1.getEnableProgramCommand(treeDataProv), disableProgramCommand_1.getDisableProgramCommand(treeDataProv), removeSessionCommand_1.getRemoveSessionCommand(treeDataProv), filterProgramsCommand_1.getFilterProgramsCommand(treeDataProv));
        const zoweExplorerApi = vscode_1.extensions.getExtension("Zowe.vscode-extension-for-zowe");
        if (zoweExplorerApi && zoweExplorerApi.exports) {
            const importedApi = zoweExplorerApi.exports;
            importedApi.registerMvsApi(new CicsSession_1.CicsApi());
            vscode_1.window.showInformationMessage("Zowe Explorer was modified for the CICS Extension");
            if (importedApi.getExplorerExtenderApi &&
                importedApi.getExplorerExtenderApi().reloadProfiles) {
                yield profileManagement_1.loadProfileManager();
                const prof = new zowe_explorer_api_1.ProfilesCache(imperative_1.Logger.getAppLogger());
                yield prof.refresh(importedApi);
                yield importedApi.getExplorerExtenderApi().reloadProfiles();
                const defaultProfile = prof.getDefaultProfile("cics");
                const profileStorage = new profileStorage_1.ProfileStorage();
                // @ts-ignore
                for (const profile of prof.profilesByType) {
                    if (profile[0] === "cics") {
                        profileStorage.setProfiles(profile[1]);
                        break;
                    }
                }
                if (defaultProfile && defaultProfile.profile) {
                    vscode_1.window.showInformationMessage(`Default CICS Profile (${defaultProfile.name}) found. Loading it now...`);
                    treeDataProv.loadExistingProfile(defaultProfile);
                    // treeDataProv.addSession(defaultProfile);
                }
                else {
                    vscode_1.window.showInformationMessage("No Default CICS Profile found.");
                }
            }
        }
    });
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map