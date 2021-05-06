import { KeytarCredentialManager } from "./KeytarCredentialManager";
import { LocalizeFunc, loadMessageBundle } from "vscode-nls";
import { getImperativeConfig } from "@zowe/cli";
import { existsSync, readFileSync } from "fs";
import { workspace, env } from "vscode";
import { window } from "vscode";
import { homedir } from "os";
import { join } from "path";
import {
  CredentialManagerFactory,
  ImperativeError,
  CliProfileManager,
  ImperativeConfig,
} from "@zowe/imperative";

const localize: LocalizeFunc = loadMessageBundle();
declare const nonWebpackRequire: typeof require;
declare const webpackRequire: typeof require;

export async function loadProfileManager() {
  const keytar = getSecurityModules("keytar");
  if (keytar) {
    KeytarCredentialManager.keytar = keytar;

    try {
      await CredentialManagerFactory.initialize({
        service: "Zowe-Plugin",
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Manager: KeytarCredentialManager,
        displayName: localize("displayName", "Zowe Explorer"),
      });
    } catch (err) {
      throw new ImperativeError({ msg: err.toString() });
    }
  }

  await CliProfileManager.initialize({
    configuration: getImperativeConfig().profiles!,
    profileRootDirectory: join(getZoweDir(), "profiles"),
  });
}

function getSecurityModules(moduleName: string): NodeRequire | undefined {
  let imperativeIsSecure: boolean = false;
  const r = typeof webpackRequire === "function" ? nonWebpackRequire : require;
  try {
    const fileName = join(getZoweDir(), "settings", "imperative.json");
    let settings: any;
    if (existsSync(fileName)) {
      settings = JSON.parse(readFileSync(fileName).toString());
    }
    const value1 = settings?.overrides.CredentialManager;
    const value2 = settings?.overrides["credential-manager"];
    imperativeIsSecure =
      (typeof value1 === "string" && value1.length > 0) ||
      (typeof value2 === "string" && value2.length > 0);
  } catch (error) {
    window.showWarningMessage(error.message);
    return undefined;
  }
  if (imperativeIsSecure) {
    // Workaround for Theia issue (https://github.com/eclipse-theia/theia/issues/4935)
    const appRoot = env.appRoot;
    try {
      return r(`${appRoot}/node_modules/${moduleName}`);
    } catch (err) {
      /* Do nothing */
    }
    try {
      return r(`${appRoot}/node_modules.asar/${moduleName}`);
    } catch (err) {
      /* Do nothing */
    }
    window.showWarningMessage(
      localize(
        "initialize.module.load",
        "Credentials not managed, unable to load security file: "
      ) + moduleName
    );
  }
  return undefined;
}

export function getZoweDir(): string {
  ImperativeConfig.instance.loadedConfig = {
    defaultHome: join(homedir(), ".zowe"),
    envVariablePrefix: "ZOWE",
  };
  return ImperativeConfig.instance.cliHome;
}
