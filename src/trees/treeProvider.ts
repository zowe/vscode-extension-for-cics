import { Session, IProfileLoaded, SessConstants } from "@zowe/imperative";
import { CICSProgramTreeItem } from "./CICSProgramTree";
import { CICSSessionTreeItem } from "./CICSSessionTree";
import { getResource } from "@zowe/cics-for-zowe-cli";
import { CICSRegionTreeItem } from "./CICSRegionTree";
import { CicsSession } from "../utils/CicsSession";
import { ProfileStorage } from "../utils/profileStorage";
import {
  ProviderResult,
  window,
  TreeDataProvider,
  Event,
  EventEmitter,
  StatusBarItem,
  StatusBarAlignment,
} from "vscode";
import { join } from "path";

export class CICSTreeDataProvider
  implements TreeDataProvider<CICSSessionTreeItem> {
  async loadPrograms(element: CICSRegionTreeItem) {
    this.showStatusBarItem();

    const programResponse = await getResource(element.parentSession.session, {
      name: "CICSProgram",
      regionName: element.region.applid,
      cicsPlex: element.parentSession.cicsPlex!,
      criteria:
        "NOT (PROGRAM=CEE* OR PROGRAM=DFH* OR PROGRAM=CJ* OR PROGRAM=EYU* OR PROGRAM=CSQ* OR PROGRAM=CEL* OR PROGRAM=IGZ*)",
      parameter: undefined,
    });

    const programs = programResponse.response.records.cicsprogram;

    for (const program of programs) {
      const programTreeItem = new CICSProgramTreeItem(program, element);
      element.addProgramChild(programTreeItem);
    }

    element.iconPath = {
      light: join(
        __filename,
        "..",
        "..",
        "..",
        "resources",
        "imgs",
        "region-green.svg"
      ),
      dark: join(
        __filename,
        "..",
        "..",
        "..",
        "resources",
        "imgs",
        "region-green.svg"
      ),
    };

    this._onDidChangeTreeData.fire(undefined);
    this.hideStatusBarItem();
  }
  removeSession(session: CICSSessionTreeItem) {
    this.sessionMap.delete(session.sessionName);
    this.refresh();
  }

  private _onDidChangeTreeData: EventEmitter<
    any | undefined
  > = new EventEmitter<any | undefined>();
  readonly onDidChangeTreeData: Event<any | undefined> = this
    ._onDidChangeTreeData.event;

  private sessionMap = new Map();
  private data: CICSSessionTreeItem[] | undefined = [];
  private statusBarItem: StatusBarItem;

  constructor() {
    this.statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
    this.statusBarItem.text = "Refreshing...";
    this.statusBarItem.tooltip = "Refreshing the current Zowe CICS tree";
    this.statusBarItem.hide();
  }

  public showStatusBarItem() {
    this.statusBarItem.show();
  }
  public hideStatusBarItem() {
    this.statusBarItem.hide();
  }

  async refresh(): Promise<void> {
    try {
      this.showStatusBarItem();
      let profileList = [];

      const listOfSessionTrees: CICSSessionTreeItem[] = [];

      for (const element of this.sessionMap) {
        const sessionName = element[0];
        const { session, cicsPlex, region } = element[1];

        const sessionTreeItem = new CICSSessionTreeItem(
          sessionName,
          session,
          cicsPlex
        );

        const getRegions = await getResource(session, {
          name: "CICSRegion",
          regionName: region!,
          cicsPlex: cicsPlex!,
          criteria: undefined,
          parameter: undefined,
        });

        const listOfRegions: any[] = !Array.isArray(
          getRegions.response.records.cicsregion
        )
          ? [getRegions.response.records.cicsregion]
          : getRegions.response.records.cicsregion;

        const regions = [];

        for (const region of listOfRegions) {
          const regionTreeItem = new CICSRegionTreeItem(
            region.applid,
            sessionTreeItem,
            region,
            []
          );

          sessionTreeItem.addRegionChild(regionTreeItem);

          regions.push({
            [region.applid]: [],
          });
        }

        listOfSessionTrees.push(sessionTreeItem);

        profileList.push({
          name: sessionName,
          session: session,
          regions: regions,
          cicsPlex: cicsPlex!,
        });
      }
      this.data = listOfSessionTrees;
      this._onDidChangeTreeData.fire(undefined);
      this.hideStatusBarItem();
    } catch (ex) {
      console.log(ex);
      window.showErrorMessage(ex);
      this.hideStatusBarItem();
    }
  }

  public async addSession(profile?: IProfileLoaded) {
    let sessionName: string | undefined;
    let host: string | undefined;
    let port: string | undefined;
    let user: string | undefined;
    let password: string | undefined;
    let cicsPlex: string | undefined;
    let region: string | undefined;
    let rejectUnauthorized: boolean = true;
    let protocol: SessConstants.HTTP_PROTOCOL_CHOICES = "https";

    if (profile && profile.profile) {
      sessionName = profile.name
        ? profile.name
        : await window.showInputBox({
            placeHolder: "Session Name",
            prompt: "Enter a name for the connection",
            value: "",
          });

      host = profile.profile.host
        ? profile.profile.host
        : await window.showInputBox({
            placeHolder: "Host name",
            prompt: "Enter the host name for the connection",
            value: "",
          });

      port = profile.profile.port
        ? profile.profile.port
        : await window.showInputBox({
            placeHolder: "Port",
            prompt: "Enter the port for the connection",
            value: "",
          });

      user = profile.profile.user
        ? profile.profile.user
        : await window.showInputBox({
            placeHolder: "Username",
            prompt: "Enter the user name used for the connection",
            value: "",
          });

      password = profile.profile.password
        ? profile.profile.password
        : await window.showInputBox({
            placeHolder: "Password",
            prompt: "Enter the password used for the connection",
            value: "",
            password: true,
          });

      rejectUnauthorized = profile.profile.rejectUnauthorized
        ? profile.profile.rejectUnauthorized
        : rejectUnauthorized;
      protocol = profile.profile.protocol ? profile.profile.protocol : protocol;

      if (profile.profile.cicsPlex) {
        cicsPlex = profile.profile.cicsPlex;
        if (profile.profile.region) {
          region = profile.profile.regionName;
        } else {
          region = profile.profile.cicsPlex;
        }
      } else if (profile.profile.regionName) {
        region = profile.profile.regionName;
      } else {
        cicsPlex = await window.showInputBox({
          placeHolder: "CICS Plex",
          prompt:
            "Enter the CICS Plex used for connection. Leave empty if using a single region system",
          value: "",
        });
        region = await window.showInputBox({
          placeHolder: "CICS Region",
          prompt: "Enter the CICS Region used for connection",
          value: "",
        });
      }
    } else {
      const profileStorage = new ProfileStorage();

      let profileNameToLoad = await window.showQuickPick(
        profileStorage
          .getProfiles()
          .filter((profile) => {
            if (!this.sessionMap.has(profile.name!)) {
              return true;
            }
            return false;
          })
          .map((profile) => {
            return { label: profile.name! };
          })
      );

      if (profileNameToLoad) {
        let profileToLoad;

        for (const prof of profileStorage.getProfiles()) {
          if (prof.name === profileNameToLoad.label) {
            profileToLoad = prof;
          }
        }

        this.addSession(profileToLoad);
      } else {
        sessionName = await window.showInputBox({
          placeHolder: "Session Name",
          prompt: "Enter a name for the connection",
          value: "",
        });

        host = await window.showInputBox({
          placeHolder: "Host name",
          prompt: "Enter the host name for the connection",
          value: "",
        });

        port = await window.showInputBox({
          placeHolder: "Port",
          prompt: "Enter the port for the connection",
          value: "0",
        });

        user = await window.showInputBox({
          placeHolder: "Username",
          prompt: "Enter the user name used for the connection",
          value: "",
        });

        password = await window.showInputBox({
          placeHolder: "Password",
          prompt: "Enter the password used for the connection",
          value: "",
          password: true,
        });

        cicsPlex = await window.showInputBox({
          placeHolder: "CICS Plex",
          prompt:
            "Enter the CICS Plex used for connection. (Leave empty if single region system)",
          value: "",
        });

        region = await window.showInputBox({
          placeHolder: "CICS Region",
          prompt: "Enter the CICS Region used for connection",
          value: "",
        });
      }
    }
    const session = new Session({
      type: "basic",
      hostname: host,
      port: Number(port),
      user: user,
      password: password,
      basePath: "",
      rejectUnauthorized: rejectUnauthorized,
      protocol: protocol,
    });

    const cicsSesison = new CicsSession(session, cicsPlex!, region!);
    this.sessionMap.set(sessionName, cicsSesison);
    await this.refresh();
  }

  getTreeItem(
    element: CICSSessionTreeItem
  ): CICSSessionTreeItem | Thenable<CICSSessionTreeItem> {
    return element;
  }

  getChildren(element?: any | undefined): ProviderResult<any[]> {
    if (element === undefined) {
      return this.data;
    }
    return element.children;
  }
}
