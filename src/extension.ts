// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as cics from "@zowe/cics-for-zowe-cli";
import * as imperative_1 from "@zowe/imperative";
import { CicsSession } from "./CicsSession";
import { CicsApi } from "./CicsApi";

import { ZoweExplorerApi, ProfilesCache } from "@zowe/zowe-explorer-api";
import { Logger } from "@zowe/imperative";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  void registerCICSApi();

  // CICS View
  const treeDataProv = new TreeDataProvider();
  vscode.window.registerTreeDataProvider("cics-view", treeDataProv);

  const addSession = vscode.commands.registerCommand(
    "cics-extension-for-zowe.addSession",
    async () => treeDataProv.addSession()
  );
  context.subscriptions.push(addSession);
  treeDataProv.refresh();

  let newCopyCommand = vscode.commands.registerCommand(
    "cics-extension-for-zowe.newCopyProgram",
    (node) => {
      // The code you place here will be executed every time your command is executed
      if (node) {
        const response = cics.programNewcopy(node.session, {
          name: node.label,
          regionName: "IY3BNCAF",
          cicsPlex: undefined,
        });
        vscode.window.showInformationMessage(
          `New Copy Requested for program ${node.label}`
        );
      } else {
        vscode.window.showErrorMessage("No CICS program selected");
      }
    }
  );

  context.subscriptions.push(newCopyCommand);
}

async function registerCICSApi() {
  const zoweExplorerApi = vscode.extensions.getExtension(
    "Zowe.vscode-extension-for-zowe"
  );

  if (zoweExplorerApi && zoweExplorerApi.exports) {
    const importedApi = zoweExplorerApi.exports as ZoweExplorerApi.IApiRegisterClient;

    Logger.initLogger({
      log4jsConfig: {
        appenders: {
          default: {
            type: "fileSync",
            layout: {
              type: "pattern",
              pattern: "[%d{yyyy/MM/dd} %d{hh:mm:ss.SSS}] [%p] %m",
            },
            filename: "logs/imperative.log",
          },
          imperative: {
            type: "fileSync",
            layout: {
              type: "pattern",
              pattern: "[%d{yyyy/MM/dd} %d{hh:mm:ss.SSS}] [%p] %m",
            },
            filename: "logs/imperative.log",
          },
          app: {
            type: "fileSync",
            layout: {
              type: "pattern",
              pattern: "[%d{yyyy/MM/dd} %d{hh:mm:ss.SSS}] [%p] %m",
            },
            filename: "logs/zowe.log",
          },
        },
        categories: {
          default: {
            appenders: ["default"],
            level: "DEBUG",
          },
          imperative: {
            appenders: ["imperative"],
            level: "DEBUG",
          },
          app: {
            appenders: ["app"],
            level: "DEBUG",
          },
        },
      },
    });
    let pp = new ProfilesCache(Logger.getAppLogger());

    console.log(pp);
    console.log(pp.getDefaultProfile());
	

    // let n = new CicsApi();
    // console.log(n.getSession());

    if (
      importedApi.getExplorerExtenderApi &&
      importedApi.getExplorerExtenderApi().reloadProfiles
    ) {
      await importedApi.getExplorerExtenderApi().reloadProfiles();
    }
    void vscode.window.showInformationMessage(
      "Zowe Explorer was modified for the CICS Extension"
    );
    return true;
  }
  void vscode.window.showInformationMessage(
    "Zowe Explorer was not found: either it is not installed or you are using an older version without extensibility API."
  );
  return false;
}

// this method is called when your extension is deactivated
export function deactivate() {}

class TreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
  // onDidChangeTreeData?: vscode.Event<TreeItem | null | undefined> | undefined;
  private _onDidChangeTreeData: vscode.EventEmitter<
    any | undefined
  > = new vscode.EventEmitter<any | undefined>();
  readonly onDidChangeTreeData: vscode.Event<any | undefined> = this
    ._onDidChangeTreeData.event;

  private sessionMap = new Map /*<string, imperative_1.Session>*/();
  private data: TreeItem[] = [];

  async refresh(): Promise<void> {
    try {
      let profileList = [];
      if (this.sessionMap.size === 0) {
        profileList.push({
          name: "Create a new CICS Session...",
          session: undefined,
          contexts: [],
          programs: [],
        });
      }
      for (const element of this.sessionMap) {
        const session = element[1].session;
        const context = element[1].context;
        const name = element[0];

        const regionResponse = await cics.getResource(session, {
          name: "CICSRegion",
          regionName: context,
          cicsPlex: undefined,
          criteria: undefined,
          parameter: undefined,
        });
        let resRegions: any = regionResponse.response.records["cicsregion"];
        if (!Array.isArray(resRegions)) {
          resRegions = [resRegions];
        }
        const contexts = resRegions.map((region: any) => region.applid);

        const programResponse = await cics.getResource(session, {
          name: "CICSProgram",
          regionName: context,
          cicsPlex: undefined,
          criteria: undefined,
          parameter: undefined,
        });
        let resPrograms: any[] =
          programResponse.response.records["cicsprogram"];
        if (!Array.isArray(resPrograms)) {
          resPrograms = [resPrograms];
        }
        const programs = resPrograms.map((program) => program.program);

        let currentProfile = {
          name: name,
          session: session,
          contexts: contexts,
          programs: programs,
        };

        profileList.push(currentProfile);
      }

      this.data = profileList.map((profile) => {
        const session = profile.session;
        const contexts = profile.contexts.map(
          (applid: string) => new TreeItem(applid, session)
        );
        const programs = profile.programs.map((progName) => {
          const programItem = new TreeItem(progName, session);
          programItem.contextValue = `cicsprogram.${progName}`;
          return programItem;
        });
        let profileChildren = [];
        if (contexts.length > 0) {
          profileChildren.push(new TreeItem("Contexts", session, contexts));
        }
        if (programs.length > 0) {
          profileChildren.push(new TreeItem("Programs", session, programs));
        }
        const profileTree = new TreeItem(
          profile.name,
          session,
          profileChildren
        );
        return profileTree;
      });
      this._onDidChangeTreeData.fire(undefined);
    } catch (error) {
      console.log(error);
    }
  }

  public async addSession() {
    //Prompt for details
    let options = {
      placeHolder: "Session Name",
      prompt: "Enter a name for the connection",
      value: "",
    };
    const sessionName = await vscode.window.showInputBox(options);

    options = {
      placeHolder: "Host name",
      prompt: "Enter the host name for the connection",
      value: "",
    };
    const hostname = await vscode.window.showInputBox(options);

    options = {
      placeHolder: "Port",
      prompt: "Enter the port for the connection",
      value: "0",
    };
    const port = await vscode.window.showInputBox(options);

    options = {
      placeHolder: "Username",
      prompt: "Enter the user name used for the connection",
      value: "",
    };
    const username = await vscode.window.showInputBox(options);

    let passOptions = {
      placeHolder: "Password",
      prompt: "Enter the password used for the connection",
      value: "",
      password: true,
    };
    const password = await vscode.window.showInputBox(passOptions);

    let contextOptions = {
      placeHolder: "Context",
      prompt: "Enter the cmci context used for connection",
      value: "",
    };
    const context = await vscode.window.showInputBox(contextOptions);

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
    const cicsSesison = new CicsSession(session, context!);
    this.sessionMap.set(sessionName, cicsSesison);
    await this.refresh();
  }

  getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(
    element?: TreeItem | undefined
  ): vscode.ProviderResult<TreeItem[]> {
    if (element === undefined) {
      return this.data;
    }
    return element.children;
  }
}

class TreeItem extends vscode.TreeItem {
  children: TreeItem[] | undefined;
  session: imperative_1.Session | undefined;

  constructor(
    label: string,
    session: imperative_1.Session | undefined,
    children?: TreeItem[]
  ) {
    super(
      label,
      children === undefined
        ? vscode.TreeItemCollapsibleState.None
        : vscode.TreeItemCollapsibleState.Expanded
    );
    this.children = children;
    this.session = session;
  }
}
