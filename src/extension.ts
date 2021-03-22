// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as cics from '@zowe/cics-for-zowe-cli';
import * as imperative_1 from '@zowe/imperative';
import { CicsSession } from './CicsSession';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// CICS View
	const treeDataProv = new TreeDataProvider();
	vscode.window.registerTreeDataProvider('cics-view', treeDataProv);
	
	const addSession = vscode.commands.registerCommand("cics-extension-for-zowe.addSession", async () => treeDataProv.addSession());
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
		} else {
			vscode.window.showErrorMessage("No CICS program selected");
		}
	});

	context.subscriptions.push(newCopyCommand);
}

// this method is called when your extension is deactivated
export function deactivate() { }

class TreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
	// onDidChangeTreeData?: vscode.Event<TreeItem | null | undefined> | undefined;
	private _onDidChangeTreeData: vscode.EventEmitter<any | undefined> = new vscode.EventEmitter<any | undefined>();
	readonly onDidChangeTreeData: vscode.Event<any | undefined> = this._onDidChangeTreeData.event;

	private sessionMap = new Map/*<string, imperative_1.Session>*/(); 
	data: TreeItem[];

	cicsData = {
		profiles: []
	};

	async refresh(): Promise<void> {
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

				const regionResponse = await cics.getResource(session, {
					name: "CICSRegion",
					regionName: context,
					cicsPlex: undefined,
					criteria: undefined,
					parameter: undefined
				});
				let resRegions: any = regionResponse.response.records["cicsregion"];
				if (!Array.isArray(resRegions)) {
					resRegions = [resRegions]
				}
				const contexts = resRegions.map(region => region.applid);
				current_profile['Contexts'] = contexts;

				const programResponse = await cics.getResource(session, {
					name: "CICSProgram",
					regionName: context,
					cicsPlex: undefined,
					criteria: undefined,
					parameter: undefined
				});
				let resPrograms: any[] = programResponse.response.records["cicsprogram"];
				if (!Array.isArray(resPrograms)) {
					resPrograms = [resPrograms]
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
				let profileChildren = []
				if (contexts.length > 0) {
					profileChildren.push(new TreeItem('Contexts', session, contexts))
				}
				if (programs.length > 0) {
					profileChildren.push(new TreeItem('Programs', session, programs))
				}
				const profileTree = new TreeItem(profile.name, session, profileChildren);
				return profileTree;
			});
			this._onDidChangeTreeData.fire(undefined);
		} catch (error) {
			console.log(error);
		}
	};

	public async addSession() {
		//Prompt for details
		let options = {
			placeHolder: "Session Name",
			prompt: "Enter a name for the connection",
			value: ""
		};
		const sessionName = await vscode.window.showInputBox(options);

		options = {
			placeHolder: "Host name",
			prompt: "Enter the host name for the connection",
			value: ""
		};
		const hostname = await vscode.window.showInputBox(options);

		options = {
			placeHolder: "Port",
			prompt: "Enter the port for the connection",
			value: "0"
		};
		const port = await vscode.window.showInputBox(options);

		options = {
			placeHolder: "Username",
			prompt: "Enter the user name used for the connection",
			value: ""
		};
		const username = await vscode.window.showInputBox(options);

		let passOptions = {
			placeHolder: "Password",
			prompt: "Enter the password used for the connection",
			value: "",
			password: true
		};
		const password = await vscode.window.showInputBox(passOptions);

		let contextOptions = {
			placeHolder: "Context",
			prompt: "Enter the cmci context used for connection",
			value: ""
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
		const cicsSesison = new CicsSession(session, context);
		this.sessionMap.set(sessionName, cicsSesison);
		await this.refresh();
	}

	getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}

	getChildren(element?: TreeItem | undefined): vscode.ProviderResult<TreeItem[]> {
		if (element === undefined) {
			return this.data;
		}
		return element.children;
	}
}

class TreeItem extends vscode.TreeItem {
	children: TreeItem[] | undefined;
	session: imperative_1.Session | undefined;

	constructor(label: string, session: imperative_1.Session | undefined, children?: TreeItem[]) {
		super(
			label,
			children === undefined ? vscode.TreeItemCollapsibleState.None :
				vscode.TreeItemCollapsibleState.Expanded);
		this.children = children;
		this.session = session;
	}
}