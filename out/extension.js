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
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const cics = require("@zowe/cics-for-zowe-cli");
const imperative_1 = require("@zowe/imperative");
const CicsSession_1 = require("./CicsSession");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // CICS View
    const treeDataProv = new TreeDataProvider();
    vscode.window.registerTreeDataProvider('cics-view', treeDataProv);
    const addSession = vscode.commands.registerCommand("cics-extension-for-zowe.addSession", () => __awaiter(this, void 0, void 0, function* () { return treeDataProv.addSession(); }));
    context.subscriptions.push(addSession);
    treeDataProv.refresh();
    let newCopyCommand = vscode.commands.registerCommand('cics-extension-for-zowe.newCopyProgram', (node) => {
        // The code you place here will be executed every time your command is executed
        if (node) {
            const response = cics.programNewcopy(node.session, {
                name: node.label,
                regionName: "IY3BNCAF",
                cicsPlex: undefined
            });
            vscode.window.showInformationMessage(`New Copy Requested for program ${node.label}`);
        }
        else {
            vscode.window.showErrorMessage("No CICS program selected");
        }
    });
    context.subscriptions.push(newCopyCommand);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
class TreeDataProvider {
    constructor() {
        // onDidChangeTreeData?: vscode.Event<TreeItem | null | undefined> | undefined;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.sessionMap = new Map /*<string, imperative_1.Session>*/();
        this.cicsData = {
            profiles: []
        };
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let profileList = [];
                if (this.sessionMap.size == 0) {
                    profileList.push({
                        'name': 'Create a new CICS Session...',
                        'Contexts': [],
                        'Programs': []
                    });
                }
                for (const element of this.sessionMap) {
                    const session = element[1].session;
                    const context = element[1].context;
                    const name = element[0];
                    let current_profile = {};
                    current_profile['name'] = name;
                    current_profile['session'] = session;
                    const regionResponse = yield cics.getResource(session, {
                        name: "CICSRegion",
                        regionName: context,
                        cicsPlex: undefined,
                        criteria: undefined,
                        parameter: undefined
                    });
                    let resRegions = regionResponse.response.records["cicsregion"];
                    if (!Array.isArray(resRegions)) {
                        resRegions = [resRegions];
                    }
                    const contexts = resRegions.map(region => region.applid);
                    current_profile['Contexts'] = contexts;
                    const programResponse = yield cics.getResource(session, {
                        name: "CICSProgram",
                        regionName: context,
                        cicsPlex: undefined,
                        criteria: undefined,
                        parameter: undefined
                    });
                    let resPrograms = programResponse.response.records["cicsprogram"];
                    if (!Array.isArray(resPrograms)) {
                        resPrograms = [resPrograms];
                    }
                    const programs = resPrograms.map(program => program.program);
                    current_profile['Programs'] = programs;
                    profileList.push(current_profile);
                }
                this.cicsData = {
                    profiles: profileList
                };
                this.data = this.cicsData.profiles.map(profile => {
                    const session = profile['session'];
                    const contexts = profile['Contexts'].map(applid => new TreeItem(applid, session));
                    const programs = profile['Programs'].map(progName => {
                        const programItem = new TreeItem(progName, session);
                        programItem.contextValue = `cicsprogram.${progName}`;
                        return programItem;
                    });
                    let profileChildren = [];
                    if (contexts.length > 0) {
                        profileChildren.push(new TreeItem('Contexts', session, contexts));
                    }
                    if (programs.length > 0) {
                        profileChildren.push(new TreeItem('Programs', session, programs));
                    }
                    const profileTree = new TreeItem(profile.name, session, profileChildren);
                    return profileTree;
                });
                this._onDidChangeTreeData.fire(undefined);
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    ;
    addSession() {
        return __awaiter(this, void 0, void 0, function* () {
            //Prompt for details
            let options = {
                placeHolder: "Session Name",
                prompt: "Enter a name for the connection",
                value: ""
            };
            const sessionName = yield vscode.window.showInputBox(options);
            options = {
                placeHolder: "Host name",
                prompt: "Enter the host name for the connection",
                value: ""
            };
            const hostname = yield vscode.window.showInputBox(options);
            options = {
                placeHolder: "Port",
                prompt: "Enter the port for the connection",
                value: "0"
            };
            const port = yield vscode.window.showInputBox(options);
            options = {
                placeHolder: "Username",
                prompt: "Enter the user name used for the connection",
                value: ""
            };
            const username = yield vscode.window.showInputBox(options);
            let passOptions = {
                placeHolder: "Password",
                prompt: "Enter the password used for the connection",
                value: "",
                password: true
            };
            const password = yield vscode.window.showInputBox(passOptions);
            let contextOptions = {
                placeHolder: "Context",
                prompt: "Enter the cmci context used for connection",
                value: ""
            };
            const context = yield vscode.window.showInputBox(contextOptions);
            const session = new imperative_1.Session({
                type: "basic",
                hostname: hostname,
                port: Number(port),
                user: username,
                password: password,
                basePath: "",
                rejectUnauthorized: false,
                protocol: "http",
            });
            const cicsSesison = new CicsSession_1.CicsSession(session, context);
            this.sessionMap.set(sessionName, cicsSesison);
            yield this.refresh();
        });
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element === undefined) {
            return this.data;
        }
        return element.children;
    }
}
class TreeItem extends vscode.TreeItem {
    constructor(label, session, children) {
        super(label, children === undefined ? vscode.TreeItemCollapsibleState.None :
            vscode.TreeItemCollapsibleState.Expanded);
        this.children = children;
        this.session = session;
    }
}
//# sourceMappingURL=extension.js.map