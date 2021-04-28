import { Session, IProfileLoaded } from "@zowe/imperative";
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

export class CICSTreeDataProvider
  implements TreeDataProvider<CICSSessionTreeItem> {
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
    this.showStatusBarItem();
    try {
      if (this.sessionMap.size > 0) {
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

          const listOfRegionNames: string[] = listOfRegions.map(
            (region: { applid: string }) => region.applid
          );

          const regions = [];

          for (const region of listOfRegions) {
            const regionTreeItem = new CICSRegionTreeItem(
              region.applid,
              sessionTreeItem,
              region,
              []
            );

            const getPrograms = await getResource(session, {
              name: "CICSProgram",
              regionName: region.applid,
              cicsPlex: cicsPlex!,
              criteria:
                "NOT (PROGRAM=CEE* OR PROGRAM=DFH* OR PROGRAM=CJ* OR PROGRAM=EYU* OR PROGRAM=CSQ* OR PROGRAM=CEL* OR PROGRAM=IGZ*)",
              parameter: undefined,
            });

            const listOfPrograms = !Array.isArray(
              getPrograms.response.records.cicsprogram
            )
              ? getPrograms.response.records.cicsprogram
              : getPrograms.response.records.cicsprogram;

            for (const program of listOfPrograms) {
              const programTreeItem = new CICSProgramTreeItem(
                program,
                regionTreeItem
              );
              regionTreeItem.addProgramChild(programTreeItem);
            }

            sessionTreeItem.addRegionChild(regionTreeItem);

            regions.push({
              [region.applid]: listOfPrograms,
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
      }
    } catch (ex) {
      console.log(ex);
      window.showErrorMessage(ex);
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
      let profileStorage = new ProfileStorage();

      let profileNameToLoad = await window.showQuickPick(
        profileStorage.getProfiles().map((prof) => {
          return {
            label: prof.name!,
          };
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
      rejectUnauthorized: false,
      protocol: "http",
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
