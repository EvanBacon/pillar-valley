import { ConfigPlugin, withDangerousMod } from "@expo/config-plugins";
import fs from "fs";
import path from "path";

import {
  withIosAccentColor,
  withIosWidgetBackgroundColor,
} from "./accentColor/withAccentColor";
import { Config } from "./config";
import { withIosIcon } from "./icon/withIosIcon";
import { getFrameworksForType, getTargetInfoPlistForType } from "./target";
import { withEASTargets } from "./withEasCredentials";
import { withXcodeChanges } from "./withXcodeChanges";

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

  config = withEASTargets(config, { targetName, bundleIdentifier: bundleId });

  if (props.accentColor) {
    const lightColor =
      typeof props.accentColor === "string"
        ? props.accentColor
        : props.accentColor.color;
    const darkColor =
      typeof props.accentColor === "string"
        ? undefined
        : props.accentColor.darkColor;
    // You use the WidgetBackground and AccentColor to style the widget configuration interface of a configurable widget. Apple could have chosen names to make that more obvious.
    // https://useyourloaf.com/blog/widget-background-and-accent-color/
    // i.e. when you press and hold on a widget to configure it, the background color of the widget configuration interface changes to the background color we set here.
    withIosAccentColor(config, {
      cwd: props.directory,
      color: lightColor,
      darkColor,
    });
  }

  if (props.widgetBackgroundColor) {
    const lightColor =
      typeof props.widgetBackgroundColor === "string"
        ? props.widgetBackgroundColor
        : props.widgetBackgroundColor.color;
    const darkColor =
      typeof props.widgetBackgroundColor === "string"
        ? undefined
        : props.widgetBackgroundColor.darkColor;
    withIosWidgetBackgroundColor(config, {
      cwd: props.directory,
      color: lightColor,
      darkColor,
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
