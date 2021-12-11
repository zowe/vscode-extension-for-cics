import { join } from "path";

export function getIconPathInResources(iconFileNameLight: string, iconFileNameDark: string) {
    return {
        light: join(
          __dirname,
          "..",
          "..",
          "resources",
          "imgs",
          iconFileNameLight
        ),
        dark: join(
          __dirname,
          "..",
          "..",
          "resources",
          "imgs",
          iconFileNameDark
        ),
      };
}