import { ProfileStorage } from "../utils/profileStorage";
import { ProfilesCache } from "@zowe/zowe-explorer-api";
import { CICSProgramTreeItem } from "./CICSProgramTree";
import { CICSSessionTreeItem } from "./CICSSessionTree";
import { getResource } from "@zowe/cics-for-zowe-cli";
import { CICSRegionTreeItem } from "./CICSRegionTree";
import { CicsSession } from "../utils/CicsSession";
import { addProfileHtml } from "./webviewHTML";
import {
  Session,
  IProfileLoaded,
  Logger,
  ISaveProfile,
} from "@zowe/imperative";
import {
  ProviderResult,
  window,
  TreeDataProvider,
  Event,
  EventEmitter,
  StatusBarItem,
  StatusBarAlignment,
  WebviewPanel,
} from "vscode";
import { join } from "path";

export class CICSTreeDataProvider
  implements TreeDataProvider<CICSSessionTreeItem> {
  async loadPrograms(element: CICSRegionTreeItem) {
    this.showStatusBarItem();
    window.showInformationMessage(
      `Retrieving Programs for Region ${element.region.applid}`
    );

    try {
      const programResponse = await getResource(element.parentSession.session, {
        name: "CICSProgram",
        regionName: element.region.applid,
        cicsPlex: element.parentSession.cicsPlex!,
        criteria:
          "NOT (PROGRAM=CEE* OR PROGRAM=DFH* OR PROGRAM=CJ* OR PROGRAM=EYU* OR PROGRAM=CSQ* OR PROGRAM=CEL* OR PROGRAM=IGZ*)",
        parameter: undefined,
      });

      const programs = programResponse.response.records.cicsprogram
        ? programResponse.response.records.cicsprogram
        : [];

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
      window.showInformationMessage(`Programs Retrieved`);
    } catch (error) {
      window.showErrorMessage(error.message);
    } finally {
      this._onDidChangeTreeData.fire(undefined);
      this.hideStatusBarItem();
    }
  }
  removeSession(session: CICSSessionTreeItem) {
    try {
      window.showInformationMessage(`Removing Session ${session.label}`);
      this.sessionMap.delete(session.sessionName);
      this.refresh();
    } catch (error) {
      window.showErrorMessage(error.message);
    }
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
    } catch (error) {
      window.showErrorMessage(error.message);
      this.hideStatusBarItem();
    }
  }

  public async loadExistingProfile(profile?: IProfileLoaded) {
    try {
      const session = new Session({
        type: "basic",
        hostname: profile!.profile!.host,
        port: Number(profile!.profile!.port),
        user: profile!.profile!.user,
        password: profile!.profile!.password,
        rejectUnauthorized: profile!.profile!.rejectUnauthorized,
        protocol: profile!.profile!.protocol,
      });

      let cicsPlex;
      let region;
      if (profile!.profile!.cicsPlex) {
        cicsPlex = profile!.profile!.cicsPlex;
        region = profile!.profile!.cicsPlex;
      } else {
        region = profile!.profile!.regionName;
      }

      const cicsSesison = new CicsSession(session, cicsPlex, region);
      this.sessionMap.set(profile!.name, cicsSesison);
    } catch (error) {
      window.showErrorMessage(error.message);
    } finally {
      await this.refresh();
    }
  }

  public async addSession() {
    const profileStorage = new ProfileStorage();

    if (profileStorage.getProfiles()) {
      const profilesFound = profileStorage
        .getProfiles()
        .filter((profile) => {
          if (!this.sessionMap.has(profile.name!)) {
            return true;
          }
          return false;
        })
        .map((profile) => {
          return { label: profile.name! };
        });

      if (profilesFound.length === 0) {
        window.showInformationMessage(
          "No Profiles Found... Create a CICS profile"
        );
        this.noProfiles();
      } else {
        const profileNameToLoad = await window.showQuickPick(profilesFound);

        if (profileNameToLoad) {
          window.showInformationMessage(
            `Loading CICS Profile (${profileNameToLoad.label})`
          );
          let profileToLoad;

          for (const prof of profileStorage.getProfiles()) {
            if (prof.name === profileNameToLoad.label) {
              profileToLoad = prof;
            }
          }

          this.loadExistingProfile(profileToLoad);
        } else {
          this.noProfiles();
        }
      }
    } else {
      window.showInformationMessage(
        "No Profiles Found... Create a CICS profile"
      );
      this.noProfiles();
    }
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

  noProfiles(): void {
    const column = window.activeTextEditor
      ? window.activeTextEditor.viewColumn
      : undefined;
    const panel: WebviewPanel = window.createWebviewPanel(
      "zowe",
      `Create Session`,
      column || 1,
      { enableScripts: true }
    );
    panel.webview.html = addProfileHtml();

    panel.webview.onDidReceiveMessage(async (message) => {
      try {
        const session = new Session(message.session);

        const cicsSesison = new CicsSession(
          session,
          message.cicsPlex,
          message.region
        );
        this.sessionMap.set(message.name, cicsSesison);
        panel.dispose();

        const prof = new ProfilesCache(Logger.getAppLogger());
        const newProfile: ISaveProfile = {
          profile: {
            name: message.name,
            host: message.session.hostname,
            port: message.session.port,
            user: message.session.user,
            password: message.session.password,
            rejectUnauthorized: message.session.rejectUnauthorized,
            protocol: message.session.protocol,
            regionName: message.region,
            cicsPlex: message.cicsPlex,
          },
          name: message.name,
          type: "cics",
          overwrite: true,
        };

        await prof.getCliProfileManager("cics").save(newProfile);
      } catch (error) {
        window.showErrorMessage(error.message);
      } finally {
        await this.refresh();
      }
    });
  }
}
