import { ConfigPlugin, withDangerousMod } from "@expo/config-plugins";
import plist from "@expo/plist";
import fs from "fs";
import { sync as globSync } from "glob";
import path from "path";

import { withIosColorAsset } from "./accentColor/withAccentColor";
import { Config, Entitlements } from "./config";
import { withIosIcon } from "./icon/withIosIcon";
import { getFrameworksForType, getTargetInfoPlistForType } from "./target";
import { withEASTargets } from "./withEasCredentials";
import { withXcodeChanges } from "./withXcodeChanges";
import { withImageAsset } from "./icon/withImageAsset";

type Props = Config & {
  directory: string;
};

function kebabToCamelCase(str: string) {
  return str.replace(/-([a-z])/g, function (g) {
    return g[1].toUpperCase();
  });
}
const withWidget: ConfigPlugin<Props> = (config, props) => {
  // TODO: Magically based on the top-level folders in the `ios-widgets/` folder

  if (props.icon && !/https?:\/\//.test(props.icon)) {
    props.icon = path.join(props.directory, props.icon);
  }

  const widgetDir = (props.name ?? path.basename(props.directory))
    .replace(/\/+$/, "")
    .replace(/^\/+/, "");

  const widget = kebabToCamelCase(widgetDir);

  const widgetFolderAbsolutePath = path.join(
    config._internal?.projectRoot ?? "",
    props.directory
  );

  const entitlementsFiles = globSync("*.entitlements", {
    absolute: true,
    cwd: widgetFolderAbsolutePath,
  });

  if (entitlementsFiles.length > 1) {
    throw new Error(
      `Found multiple entitlements files in ${widgetFolderAbsolutePath}`
    );
  }

  let entitlementsJson: undefined | Entitlements = props.entitlements;

  // If the user defined entitlements, then overwrite any existing entitlements file
  if (props.entitlements) {
    withDangerousMod(config, [
      "ios",
      async (config) => {
        const entitlementsFilePath =
          entitlementsFiles[0] ??
          // Use the name `generated` to help indicate that this file should be in sync with the config
          path.join(widgetFolderAbsolutePath, `generated.entitlements`);

        if (entitlementsFiles[0]) {
          console.log(
            `[${widget}] Replacing ${path.relative(
              widgetFolderAbsolutePath,
              entitlementsFiles[0]
            )} with entitlements JSON from config`
          );
        }
        fs.writeFileSync(
          entitlementsFilePath,
          plist.build(props.entitlements as any)
        );
        return config;
      },
    ]);
  } else {
    entitlementsJson = entitlementsFiles[0]
      ? plist.parse(fs.readFileSync(entitlementsFiles[0], "utf8"))
      : undefined;
  }

  // Ensure the entry file exists
  withDangerousMod(config, [
    "ios",
    async (config) => {
      fs.mkdirSync(widgetFolderAbsolutePath, { recursive: true });

      const files: [string, string][] = [
        ["Info.plist", getTargetInfoPlistForType(props.type)],
      ];

      // if (props.type === "widget") {
      //   files.push(
      //     [
      //       "index.swift",
      //       ENTRY_FILE.replace(
      //         "// Export widgets here",
      //         "// Export widgets here\n" + `        ${widget}()`
      //       ),
      //     ],
      //     [widget + ".swift", WIDGET.replace(/alpha/g, widget)],
      //     [widget + ".intentdefinition", INTENT_DEFINITION]
      //   );
      // }

      files.forEach(([filename, content]) => {
        const filePath = path.join(widgetFolderAbsolutePath, filename);
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, content);
        }
      });

      return config;
    },
  ]);

  const targetName = widget;
  const bundleId = config.ios!.bundleIdentifier! + "." + widget;

  withXcodeChanges(config, {
    name: targetName,
    cwd:
      "../" +
      path.relative(
        config._internal!.projectRoot,
        path.resolve(props.directory)
      ),
    deploymentTarget: props.deploymentTarget ?? "16.4",
    bundleId,

    hasAccentColor: !!props.accentColor,

    // @ts-expect-error: who cares
    currentProjectVersion: config.ios?.buildNumber || 1,

    frameworks: getFrameworksForType(props.type).concat(props.frameworks || []),
    type: props.type,
    teamId: props.appleTeamId,
  });

  config = withEASTargets(config, {
    targetName,
    bundleIdentifier: bundleId,
    entitlements: entitlementsJson,
  });

  if (props.images) {
    Object.entries(props.images).forEach(([name, image]) => {
      withImageAsset(config, {
        image,
        name,
        cwd: props.directory,
      });
    });
  }

  props.colors = props.colors ?? {};
  const colors: NonNullable<Props["colors"]> = props.colors ?? {};

  // You use the WidgetBackground and AccentColor to style the widget configuration interface of a configurable widget. Apple could have chosen names to make that more obvious.
  // https://useyourloaf.com/blog/widget-background-and-accent-color/
  // i.e. when you press and hold on a widget to configure it, the background color of the widget configuration interface changes to the background color we set here.
  if (props.widgetBackgroundColor)
    colors["WidgetBackground"] = props.widgetBackgroundColor;
  if (props.accentColor) colors["AccentColor"] = props.accentColor;

  if (props.colors) {
    Object.entries(props.colors).forEach(([name, color]) => {
      withIosColorAsset(config, {
        cwd: props.directory,
        name,
        color: typeof color === "string" ? color : color.light,
        darkColor: typeof color === "string" ? undefined : color.dark,
      });
    });
  }

  if (props.icon) {
    withIosIcon(config, {
      type: props.type,
      cwd: props.directory,
      // TODO: read from the top-level icon.png file in the folder -- ERR this doesn't allow for URLs
      iconFilePath: props.icon,
    });
  }

  return config;
};

export default withWidget;
