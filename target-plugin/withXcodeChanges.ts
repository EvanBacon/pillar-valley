import { ConfigPlugin } from "@expo/config-plugins";
import {
  PBXAggregateTarget,
  PBXBuildFile,
  PBXContainerItemProxy,
  PBXCopyFilesBuildPhase,
  PBXFileReference,
  PBXFrameworksBuildPhase,
  PBXGroup,
  PBXLegacyTarget,
  PBXNativeTarget,
  PBXResourcesBuildPhase,
  PBXSourcesBuildPhase,
  PBXTargetDependency,
  XCBuildConfiguration,
  XCConfigurationList,
  XcodeProject,
} from "@bacons/xcode";
import { ExpoConfig } from "@expo/config";
import { withXcodeProjectBeta } from "./withXcparse";
import { sync as globSync } from "glob";
import path from "path";
import { BuildSettings } from "@bacons/xcode/json";

export type XcodeSettings = {
  name: string;
  /** Directory relative to the project root, (i.e. outside of the `ios` directory) where the widget code should live. */
  cwd: string;

  bundleId: string;
  // 16.4
  deploymentTarget: string;

  // 1
  currentProjectVersion: number;

  frameworks: string[];

  type: ExtensionType;

  hasAccentColor?: boolean;

  teamId?: string;
};

export const withXcodeChanges: ConfigPlugin<XcodeSettings> = (
  config,
  props
) => {
  return withXcodeProjectBeta(config, (config) => {
    // @ts-ignore
    applyXcodeChanges(config, config.modResults, props);
    return config;
  });
};

import fs from "fs";
import {
  ExtensionType,
  getDefaultBuildConfigurationForTarget,
  getInfoPlistForTarget,
  getMainAppTarget,
  isNativeTargetOfType,
  KNOWN_EXTENSION_POINT_IDENTIFIERS,
  needsEmbeddedSwift,
  productTypeForType,
} from "./target";

function createNotificationContentConfigurationList(
  project: XcodeProject,
  {
    name,
    cwd,
    bundleId,
    deploymentTarget,
    currentProjectVersion,
  }: XcodeSettings
) {
  const common: BuildSettings = {
    CLANG_ANALYZER_NONNULL: "YES",
    CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION: "YES_AGGRESSIVE",
    CLANG_CXX_LANGUAGE_STANDARD: "gnu++20",
    CLANG_ENABLE_OBJC_WEAK: "YES",
    CLANG_WARN_DOCUMENTATION_COMMENTS: "YES",
    CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER: "YES",
    CLANG_WARN_UNGUARDED_AVAILABILITY: "YES_AGGRESSIVE",
    CODE_SIGN_STYLE: "Automatic",
    COPY_PHASE_STRIP: "NO",
    DEBUG_INFORMATION_FORMAT: "dwarf-with-dsym",
    GCC_C_LANGUAGE_STANDARD: "gnu11",
    GENERATE_INFOPLIST_FILE: "YES",
    CURRENT_PROJECT_VERSION: currentProjectVersion,
    INFOPLIST_FILE: cwd + "/Info.plist",
    INFOPLIST_KEY_CFBundleDisplayName: name,
    INFOPLIST_KEY_NSHumanReadableCopyright: "",
    IPHONEOS_DEPLOYMENT_TARGET: deploymentTarget,

    LD_RUNPATH_SEARCH_PATHS:
      "$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks",
    MARKETING_VERSION: "1.0",
    MTL_FAST_MATH: "YES",
    PRODUCT_BUNDLE_IDENTIFIER: bundleId,
    PRODUCT_NAME: "$(TARGET_NAME)",
    SKIP_INSTALL: "YES",
    SWIFT_EMIT_LOC_STRINGS: "YES",
    SWIFT_OPTIMIZATION_LEVEL: "-Owholemodule",
    SWIFT_VERSION: "5.0",
    TARGETED_DEVICE_FAMILY: "1,2",
  };
  const debugBuildConfig = XCBuildConfiguration.create(project, {
    name: "Debug",
    buildSettings: {
      ...common,
      // Diff
      MTL_ENABLE_DEBUG_INFO: "INCLUDE_SOURCE",
      SWIFT_ACTIVE_COMPILATION_CONDITIONS: "DEBUG",
      SWIFT_OPTIMIZATION_LEVEL: "-Onone",
      DEBUG_INFORMATION_FORMAT: "dwarf",
    },
  });

  const releaseBuildConfig = XCBuildConfiguration.create(project, {
    name: "Release",
    buildSettings: {
      CLANG_ANALYZER_NONNULL: "YES",
      ...common,
    },
  });

  const configurationList = XCConfigurationList.create(project, {
    buildConfigurations: [debugBuildConfig, releaseBuildConfig],
    defaultConfigurationIsVisible: 0,
    defaultConfigurationName: "Release",
  });

  return configurationList;
}

function createShareConfigurationList(
  project: XcodeProject,
  {
    name,
    cwd,
    bundleId,
    deploymentTarget,
    currentProjectVersion,
  }: XcodeSettings
) {
  const common: BuildSettings = {
    CLANG_ANALYZER_NONNULL: "YES",
    CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION: "YES_AGGRESSIVE",
    CLANG_CXX_LANGUAGE_STANDARD: "gnu++20",
    CLANG_ENABLE_OBJC_WEAK: "YES",
    CLANG_WARN_DOCUMENTATION_COMMENTS: "YES",
    CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER: "YES",
    CLANG_WARN_UNGUARDED_AVAILABILITY: "YES_AGGRESSIVE",
    CODE_SIGN_STYLE: "Automatic",
    DEBUG_INFORMATION_FORMAT: "dwarf", // NOTE
    GCC_C_LANGUAGE_STANDARD: "gnu11",
    GENERATE_INFOPLIST_FILE: "YES",
    CURRENT_PROJECT_VERSION: currentProjectVersion,
    INFOPLIST_FILE: cwd + "/Info.plist",
    INFOPLIST_KEY_CFBundleDisplayName: name,
    INFOPLIST_KEY_NSHumanReadableCopyright: "",
    IPHONEOS_DEPLOYMENT_TARGET: deploymentTarget,
    LD_RUNPATH_SEARCH_PATHS:
      "$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks",
    MARKETING_VERSION: "1.0",
    MTL_FAST_MATH: "YES",
    PRODUCT_BUNDLE_IDENTIFIER: bundleId,
    PRODUCT_NAME: "$(TARGET_NAME)",
    SKIP_INSTALL: "YES",
    SWIFT_EMIT_LOC_STRINGS: "YES",
    SWIFT_OPTIMIZATION_LEVEL: "-Onone",
    SWIFT_VERSION: "5.0",
    TARGETED_DEVICE_FAMILY: "1,2",
  };
  const debugBuildConfig = XCBuildConfiguration.create(project, {
    name: "Debug",
    buildSettings: {
      ...common,
      // Diff
      MTL_ENABLE_DEBUG_INFO: "INCLUDE_SOURCE",
      SWIFT_ACTIVE_COMPILATION_CONDITIONS: "DEBUG",
    },
  });

  const releaseBuildConfig = XCBuildConfiguration.create(project, {
    name: "Release",
    buildSettings: {
      CLANG_ANALYZER_NONNULL: "YES",
      ...common,
      // Diff
      COPY_PHASE_STRIP: "NO",
    },
  });

  const configurationList = XCConfigurationList.create(project, {
    buildConfigurations: [debugBuildConfig, releaseBuildConfig],
    defaultConfigurationIsVisible: 0,
    defaultConfigurationName: "Release",
  });

  return configurationList;
}

function getMainMarketingVersion(project: XcodeProject) {
  const mainTarget = getMainAppTarget(project);
  const info = getInfoPlistForTarget(mainTarget);
  const version = info.CFBundleShortVersionString;
  // console.log('getMainMarketingVersion', mainTarget.getDisplayName(), version)

  if (!version || version === "$(MARKETING_VERSION)") {
    const config = getDefaultBuildConfigurationForTarget(mainTarget);
    // console.log('getMainMarketingVersion.fallback', config.props.buildSettings.MARKETING_VERSION)
    return config!.props.buildSettings.MARKETING_VERSION;
  }

  return version;
}

function createIMessageConfigurationList(
  project: XcodeProject,
  {
    name,
    cwd,
    bundleId,
    deploymentTarget,
    currentProjectVersion,
  }: XcodeSettings
) {
  const common: BuildSettings = {
    ASSETCATALOG_COMPILER_APPICON_NAME: "iMessage App Icon",
    CLANG_ANALYZER_NONNULL: "YES",
    CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION: "YES_AGGRESSIVE",
    CLANG_CXX_LANGUAGE_STANDARD: "gnu++20",
    CLANG_ENABLE_OBJC_WEAK: "YES",
    CLANG_WARN_DOCUMENTATION_COMMENTS: "YES",
    CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER: "YES",
    CLANG_WARN_UNGUARDED_AVAILABILITY: "YES_AGGRESSIVE",
    CODE_SIGN_STYLE: "Automatic",
    DEBUG_INFORMATION_FORMAT: "dwarf", // NOTE
    GCC_C_LANGUAGE_STANDARD: "gnu11",
    GENERATE_INFOPLIST_FILE: "YES",
    CURRENT_PROJECT_VERSION: currentProjectVersion,
    INFOPLIST_FILE: cwd + "/Info.plist",
    INFOPLIST_KEY_CFBundleDisplayName: name,
    INFOPLIST_KEY_NSHumanReadableCopyright: "",
    IPHONEOS_DEPLOYMENT_TARGET: deploymentTarget,
    LD_RUNPATH_SEARCH_PATHS:
      "$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks",
    MARKETING_VERSION: "1.0",
    MTL_FAST_MATH: "YES",
    PRODUCT_BUNDLE_IDENTIFIER: bundleId,
    PRODUCT_NAME: "$(TARGET_NAME)",
    SKIP_INSTALL: "YES",
    SWIFT_EMIT_LOC_STRINGS: "YES",
    SWIFT_OPTIMIZATION_LEVEL: "-Onone",
    SWIFT_VERSION: "5.0",
    TARGETED_DEVICE_FAMILY: "1,2",
  };
  const debugBuildConfig = XCBuildConfiguration.create(project, {
    name: "Debug",
    buildSettings: {
      ...common,
      // Diff
      MTL_ENABLE_DEBUG_INFO: "INCLUDE_SOURCE",
      SWIFT_ACTIVE_COMPILATION_CONDITIONS: "DEBUG",
    },
  });

  const releaseBuildConfig = XCBuildConfiguration.create(project, {
    name: "Release",
    buildSettings: {
      ...common,
      // Diff
      COPY_PHASE_STRIP: "NO",
    },
  });

  const configurationList = XCConfigurationList.create(project, {
    buildConfigurations: [debugBuildConfig, releaseBuildConfig],
    defaultConfigurationIsVisible: 0,
    defaultConfigurationName: "Release",
  });

  return configurationList;
}
function createWatchAppConfigurationList(
  project: XcodeProject,
  {
    name,
    cwd,
    bundleId,
    deploymentTarget,
    currentProjectVersion,
    hasAccentColor,
  }: XcodeSettings
) {
  const mainAppTarget = getDefaultBuildConfigurationForTarget(
    getMainAppTarget(project)
  );
  // NOTE: No base Info.plist needed.

  // @ts-expect-error
  const common: BuildSettings = {
    ASSETCATALOG_COMPILER_APPICON_NAME: "AppIcon",
    CLANG_ANALYZER_NONNULL: "YES",
    CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION: "YES_AGGRESSIVE",
    CLANG_CXX_LANGUAGE_STANDARD: "gnu++20",
    CLANG_ENABLE_OBJC_WEAK: "YES",
    CLANG_WARN_DOCUMENTATION_COMMENTS: "YES",
    CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER: "YES",
    CLANG_WARN_UNGUARDED_AVAILABILITY: "YES_AGGRESSIVE",
    CODE_SIGN_STYLE: "Automatic",
    CURRENT_PROJECT_VERSION: currentProjectVersion,
    ENABLE_PREVIEWS: "YES",
    GCC_C_LANGUAGE_STANDARD: "gnu11",
    INFOPLIST_FILE: cwd + "/Info.plist",
    GENERATE_INFOPLIST_FILE: "YES",
    INFOPLIST_KEY_CFBundleDisplayName: name,
    INFOPLIST_KEY_UISupportedInterfaceOrientations:
      "UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown",
    INFOPLIST_KEY_WKCompanionAppBundleIdentifier:
      mainAppTarget!.props.buildSettings.PRODUCT_BUNDLE_IDENTIFIER,
    // INFOPLIST_KEY_WKCompanionAppBundleIdentifier: "$(BUNDLE_IDENTIFIER)",
    // INFOPLIST_KEY_WKCompanionAppBundleIdentifier: rootBundleId,
    LD_RUNPATH_SEARCH_PATHS: "$(inherited) @executable_path/Frameworks",
    MARKETING_VERSION: "1.0",
    MTL_FAST_MATH: "YES",
    PRODUCT_BUNDLE_IDENTIFIER: bundleId,
    PRODUCT_NAME: "$(TARGET_NAME)",
    SDKROOT: "watchos",
    SKIP_INSTALL: "YES",
    SWIFT_EMIT_LOC_STRINGS: "YES",
    SWIFT_OPTIMIZATION_LEVEL: "-Onone",
    SWIFT_VERSION: "5.0",
    TARGETED_DEVICE_FAMILY: "4",
    WATCHOS_DEPLOYMENT_TARGET: deploymentTarget ?? "9.4",
    // WATCHOS_DEPLOYMENT_TARGET: 9.4,
  };

  if (hasAccentColor) {
    common.ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME = "AccentColor";
  }

  const debugBuildConfig = XCBuildConfiguration.create(project, {
    name: "Debug",
    buildSettings: {
      ...common,
      // Diff
      MTL_ENABLE_DEBUG_INFO: "INCLUDE_SOURCE",
      SWIFT_ACTIVE_COMPILATION_CONDITIONS: "DEBUG",
      DEBUG_INFORMATION_FORMAT: "dwarf", // NOTE
    },
  });

  const releaseBuildConfig = XCBuildConfiguration.create(project, {
    name: "Release",
    buildSettings: {
      ...common,
      // Diff
      SWIFT_OPTIMIZATION_LEVEL: "-Owholemodule",
      COPY_PHASE_STRIP: "NO",
      DEBUG_INFORMATION_FORMAT: "dwarf-with-dsym",
    },
  });

  const configurationList = XCConfigurationList.create(project, {
    buildConfigurations: [debugBuildConfig, releaseBuildConfig],
    defaultConfigurationIsVisible: 0,
    defaultConfigurationName: "Release",
  });

  return configurationList;
}
function createSafariConfigurationList(
  project: XcodeProject,
  {
    name,
    cwd,
    bundleId,
    deploymentTarget,
    currentProjectVersion,
  }: XcodeSettings
) {
  const common: BuildSettings = {
    CLANG_ANALYZER_NONNULL: "YES",
    CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION: "YES_AGGRESSIVE",
    CLANG_CXX_LANGUAGE_STANDARD: "gnu++20",
    CLANG_ENABLE_OBJC_WEAK: "YES",
    CLANG_WARN_DOCUMENTATION_COMMENTS: "YES",
    CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER: "YES",
    CLANG_WARN_UNGUARDED_AVAILABILITY: "YES_AGGRESSIVE",
    CODE_SIGN_STYLE: "Automatic",
    GCC_C_LANGUAGE_STANDARD: "gnu11",
    GENERATE_INFOPLIST_FILE: "YES",
    CURRENT_PROJECT_VERSION: currentProjectVersion,
    INFOPLIST_FILE: cwd + "/Info.plist",
    INFOPLIST_KEY_CFBundleDisplayName: name,
    INFOPLIST_KEY_NSHumanReadableCopyright: "",
    IPHONEOS_DEPLOYMENT_TARGET: deploymentTarget,
    LD_RUNPATH_SEARCH_PATHS:
      "$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks",
    MARKETING_VERSION: "1.0",
    MTL_FAST_MATH: "YES",
    PRODUCT_BUNDLE_IDENTIFIER: bundleId,
    PRODUCT_NAME: "$(TARGET_NAME)",
    SKIP_INSTALL: "YES",
    SWIFT_EMIT_LOC_STRINGS: "YES",
    SWIFT_OPTIMIZATION_LEVEL: "-Onone",
    SWIFT_VERSION: "5.0",
    TARGETED_DEVICE_FAMILY: "1,2",
    OTHER_LDFLAGS: [`-framework`, "SafariServices"],
  };

  const debugBuildConfig = XCBuildConfiguration.create(project, {
    name: "Debug",
    buildSettings: {
      ...common,
      // Diff
      MTL_ENABLE_DEBUG_INFO: "INCLUDE_SOURCE",
      SWIFT_ACTIVE_COMPILATION_CONDITIONS: "DEBUG",
      DEBUG_INFORMATION_FORMAT: "dwarf", // NOTE
    },
  });

  const releaseBuildConfig = XCBuildConfiguration.create(project, {
    name: "Release",
    buildSettings: {
      ...common,
      // Diff
      SWIFT_OPTIMIZATION_LEVEL: "-Owholemodule",
      COPY_PHASE_STRIP: "NO",
      DEBUG_INFORMATION_FORMAT: "dwarf-with-dsym",
    },
  });

  const configurationList = XCConfigurationList.create(project, {
    buildConfigurations: [debugBuildConfig, releaseBuildConfig],
    defaultConfigurationIsVisible: 0,
    defaultConfigurationName: "Release",
  });

  return configurationList;
}
function createAppClipConfigurationList(
  project: XcodeProject,
  {
    name,
    cwd,
    bundleId,
    deploymentTarget,
    currentProjectVersion,
    hasAccentColor,
  }: XcodeSettings
) {
  // TODO: Unify AppIcon and AccentColor logic
  const dynamic: Partial<BuildSettings> = {
    CURRENT_PROJECT_VERSION: currentProjectVersion,
    INFOPLIST_FILE: cwd + "/Info.plist",
    INFOPLIST_KEY_CFBundleDisplayName: name,
    IPHONEOS_DEPLOYMENT_TARGET: deploymentTarget,
    MARKETING_VERSION: "1.0",
    PRODUCT_BUNDLE_IDENTIFIER: bundleId,

    // TODO: Add this later like entitlements

    // DEVELOPMENT_ASSET_PATHS: `\"${cwd}/Preview Content\"`,
  };

  if (hasAccentColor) {
    dynamic.ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME = "AccentColor";
  }

  const superCommon: Partial<BuildSettings> = {
    CLANG_ANALYZER_NONNULL: "YES",
    CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION: "YES_AGGRESSIVE",
    CLANG_CXX_LANGUAGE_STANDARD: "gnu++20",
    CLANG_ENABLE_OBJC_WEAK: "YES",
    CLANG_WARN_DOCUMENTATION_COMMENTS: "YES",
    CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER: "YES",
    CLANG_WARN_UNGUARDED_AVAILABILITY: "YES_AGGRESSIVE",
    CODE_SIGN_STYLE: "Automatic",

    COPY_PHASE_STRIP: "NO",

    PRODUCT_NAME: "$(TARGET_NAME)",
    SWIFT_EMIT_LOC_STRINGS: "YES",
    SWIFT_VERSION: "5.0",
    TARGETED_DEVICE_FAMILY: "1,2",
  };

  const infoPlist: Partial<BuildSettings> = {
    GENERATE_INFOPLIST_FILE: "YES",
    INFOPLIST_KEY_UIApplicationSceneManifest_Generation: "YES",
    INFOPLIST_KEY_UIApplicationSupportsIndirectInputEvents: "YES",
    INFOPLIST_KEY_UILaunchScreen_Generation: "YES",
    INFOPLIST_KEY_UISupportedInterfaceOrientations_iPad:
      "UIInterfaceOrientationPortrait UIInterfaceOrientationPortraitUpsideDown UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight",
    INFOPLIST_KEY_UISupportedInterfaceOrientations_iPhone:
      "UIInterfaceOrientationPortrait UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight",
  };

  // @ts-expect-error
  const common: BuildSettings = {
    ...dynamic,
    ...infoPlist,
    ...superCommon,

    ASSETCATALOG_COMPILER_APPICON_NAME: "AppIcon",

    LD_RUNPATH_SEARCH_PATHS: "$(inherited) @executable_path/Frameworks",
    MTL_FAST_MATH: "YES",
    ENABLE_PREVIEWS: "YES",
  };

  const debugBuildConfig = XCBuildConfiguration.create(project, {
    name: "Debug",
    buildSettings: {
      ...common,
      SWIFT_OPTIMIZATION_LEVEL: "-Onone",
      // Diff
      MTL_ENABLE_DEBUG_INFO: "INCLUDE_SOURCE",
      SWIFT_ACTIVE_COMPILATION_CONDITIONS: "DEBUG",
      DEBUG_INFORMATION_FORMAT: "dwarf", // NOTE
    },
  });

  const releaseBuildConfig = XCBuildConfiguration.create(project, {
    name: "Release",
    buildSettings: {
      ...common,
      // Diff
      SWIFT_OPTIMIZATION_LEVEL: "-Owholemodule",
      COPY_PHASE_STRIP: "NO",
      DEBUG_INFORMATION_FORMAT: "dwarf-with-dsym",
    },
  });

  const configurationList = XCConfigurationList.create(project, {
    buildConfigurations: [debugBuildConfig, releaseBuildConfig],
    defaultConfigurationIsVisible: 0,
    defaultConfigurationName: "Release",
  });

  return configurationList;
}

function createConfigurationList(
  project: XcodeProject,
  {
    name,
    cwd,
    bundleId,
    deploymentTarget,
    currentProjectVersion,
  }: XcodeSettings
) {
  const debugBuildConfig = XCBuildConfiguration.create(project, {
    name: "Debug",
    buildSettings: {
      ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME: "AccentColor",
      ASSETCATALOG_COMPILER_WIDGET_BACKGROUND_COLOR_NAME: "WidgetBackground",
      CLANG_ANALYZER_NONNULL: "YES",
      CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION: "YES_AGGRESSIVE",
      CLANG_CXX_LANGUAGE_STANDARD: "gnu++20",
      CLANG_ENABLE_OBJC_WEAK: "YES",
      CLANG_WARN_DOCUMENTATION_COMMENTS: "YES",
      CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER: "YES",
      CLANG_WARN_UNGUARDED_AVAILABILITY: "YES_AGGRESSIVE",
      CODE_SIGN_STYLE: "Automatic",
      CURRENT_PROJECT_VERSION: currentProjectVersion,
      DEBUG_INFORMATION_FORMAT: "dwarf",
      GCC_C_LANGUAGE_STANDARD: "gnu11",
      GENERATE_INFOPLIST_FILE: "YES",
      INFOPLIST_FILE: cwd + "/Info.plist",
      INFOPLIST_KEY_CFBundleDisplayName: name,
      INFOPLIST_KEY_NSHumanReadableCopyright: "",
      IPHONEOS_DEPLOYMENT_TARGET: deploymentTarget,
      LD_RUNPATH_SEARCH_PATHS:
        "$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks",
      MARKETING_VERSION: "1.0",
      MTL_ENABLE_DEBUG_INFO: "INCLUDE_SOURCE",
      MTL_FAST_MATH: "YES",
      PRODUCT_BUNDLE_IDENTIFIER: bundleId,
      PRODUCT_NAME: "$(TARGET_NAME)",
      SKIP_INSTALL: "YES",
      SWIFT_ACTIVE_COMPILATION_CONDITIONS: "DEBUG",
      SWIFT_EMIT_LOC_STRINGS: "YES",
      SWIFT_OPTIMIZATION_LEVEL: "-Onone",
      SWIFT_VERSION: "5",
      TARGETED_DEVICE_FAMILY: "1,2",
    },
  });

  const releaseBuildConfig = XCBuildConfiguration.create(project, {
    name: "Release",
    buildSettings: {
      ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME: "AccentColor",
      ASSETCATALOG_COMPILER_WIDGET_BACKGROUND_COLOR_NAME: "WidgetBackground",
      CLANG_ANALYZER_NONNULL: "YES",
      CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION: "YES_AGGRESSIVE",
      CLANG_CXX_LANGUAGE_STANDARD: "gnu++20",
      CLANG_ENABLE_OBJC_WEAK: "YES",
      CLANG_WARN_DOCUMENTATION_COMMENTS: "YES",
      CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER: "YES",
      CLANG_WARN_UNGUARDED_AVAILABILITY: "YES_AGGRESSIVE",
      CODE_SIGN_STYLE: "Automatic",
      COPY_PHASE_STRIP: "NO",
      CURRENT_PROJECT_VERSION: currentProjectVersion,
      DEBUG_INFORMATION_FORMAT: "dwarf-with-dsym",
      GCC_C_LANGUAGE_STANDARD: "gnu11",
      GENERATE_INFOPLIST_FILE: "YES",
      INFOPLIST_FILE: cwd + "/Info.plist",
      INFOPLIST_KEY_CFBundleDisplayName: name,
      INFOPLIST_KEY_NSHumanReadableCopyright: "",
      IPHONEOS_DEPLOYMENT_TARGET: deploymentTarget,
      LD_RUNPATH_SEARCH_PATHS:
        "$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks",
      MARKETING_VERSION: "1.0",
      MTL_FAST_MATH: "YES",
      PRODUCT_BUNDLE_IDENTIFIER: bundleId,
      PRODUCT_NAME: "$(TARGET_NAME)",
      SKIP_INSTALL: "YES",
      SWIFT_EMIT_LOC_STRINGS: "YES",
      SWIFT_OPTIMIZATION_LEVEL: "-Owholemodule",
      SWIFT_VERSION: "5",
      TARGETED_DEVICE_FAMILY: "1,2",
    },
  });

  const configurationList = XCConfigurationList.create(project, {
    buildConfigurations: [debugBuildConfig, releaseBuildConfig],
    defaultConfigurationIsVisible: 0,
    defaultConfigurationName: "Release",
  });

  return configurationList;
}

function createConfigurationListForType(
  project: XcodeProject,
  props: XcodeSettings
) {
  if (props.type === "widget") {
    return createConfigurationList(project, props);
  } else if (props.type === "share") {
    return createShareConfigurationList(project, props);
  } else if (props.type === "safari") {
    return createSafariConfigurationList(project, props);
  } else if (props.type === "imessage") {
    return createIMessageConfigurationList(project, props);
  } else if (props.type === "clip") {
    return createAppClipConfigurationList(project, props);
  } else if (props.type === "watch") {
    return createWatchAppConfigurationList(project, props);
  } else {
    // TODO: More
    return createNotificationContentConfigurationList(project, props);
  }
}

/** It's common for all frameworks to exist in the top-level "Frameworks" folder that shows in Xcode. */
function addFrameworksToDisplayFolder(
  project: XcodeProject,
  frameworks: PBXFileReference[]
) {
  // TODO: Ensure existence
  let mainFrameworksGroup = project.rootObject.props.mainGroup
    .getChildGroups()
    .find((group) => group.getDisplayName() === "Frameworks");

  // If this happens, there's a big problem. But just in case...
  if (!mainFrameworksGroup) {
    mainFrameworksGroup = project.rootObject.props.mainGroup.createGroup({
      name: "Frameworks",
      sourceTree: "<group>",
    });
  }

  frameworks.forEach((file) => {
    if (
      !mainFrameworksGroup!.props.children.find(
        (child) => child.getDisplayName() === file.getDisplayName()
      )
    ) {
      mainFrameworksGroup!.props.children.push(file);
    }
  });
}

async function applyXcodeChanges(
  config: ExpoConfig,
  project: XcodeProject,
  props: XcodeSettings
) {
  const mainAppTarget = getMainAppTarget(project);

  // Special setting for share extensions.
  if (needsEmbeddedSwift(props.type)) {
    // Add ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES to the main app target
    mainAppTarget.props.buildConfigurationList.props.buildConfigurations.forEach(
      (buildConfig) => {
        buildConfig.props.buildSettings.ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES =
          "YES";
      }
    );
  }

  function getExtensionTargets(): PBXNativeTarget[] {
    return project.rootObject.props.targets.filter((target) => {
      return (
        PBXNativeTarget.is(target) && isNativeTargetOfType(target, props.type)
      );
    }) as PBXNativeTarget[];
  }

  const targets = getExtensionTargets();

  const productName = props.name;
  // const productName = props.name + "Extension";

  const targetToUpdate =
    targets.find((target) => target.props.productName === productName) ??
    targets[0];

  if (targetToUpdate) {
    console.log(
      `Target "${targetToUpdate.props.productName}" already exists, updating instead of creating a new one`
    );
  }

  function getFramework(name: string): PBXFileReference {
    const frameworkName = name + ".framework";
    for (const [, entry] of project.entries()) {
      if (
        PBXFileReference.is(entry) &&
        entry.props.lastKnownFileType === "wrapper.framework" &&
        entry.props.sourceTree === "SDKROOT" &&
        entry.props.name === frameworkName
      ) {
        return entry;
      }
    }
    return PBXFileReference.create(project, {
      explicitFileType: "wrapper.framework",
      sourceTree: "SDKROOT",
      path: "System/Library/Frameworks/" + frameworkName,
    });
  }
  const magicCwd = path.join(config._internal!.projectRoot!, "ios", props.cwd);

  function getOrCreateBuildFile(file: PBXFileReference): PBXBuildFile {
    for (const entry of file.getReferrers()) {
      if (PBXBuildFile.is(entry) && entry.props.fileRef.uuid === file.uuid) {
        return entry;
      }
    }
    return PBXBuildFile.create(project, {
      fileRef: file,
    });
  }

  // Add the widget target to the display folder (cosmetic)
  addFrameworksToDisplayFolder(
    project,
    props.frameworks.map((framework) => getFramework(framework))
  );

  const developmentTeamId =
    props.teamId ??
    mainAppTarget.props.buildConfigurationList.props.buildConfigurations.reduce(
      // @ts-expect-error
      (acc, config) => {
        if (config.props.buildSettings.DEVELOPMENT_TEAM) {
          return config.props.buildSettings.DEVELOPMENT_TEAM;
        }
        return acc;
      },
      undefined
    );

  if (!developmentTeamId) {
    // if (process.env.CI) {
    throw new Error(
      "Couldn't find DEVELOPMENT_TEAM in Xcode project and none were provided in the Expo config."
    );
    // } else {
    //   console.warn(
    //     "Couldn't find DEVELOPMENT_TEAM in Xcode project and none were provided in the Expo config."
    //   );
    // }
  }

  function configureTargetWithDevelopmentTeamId(
    target: PBXNativeTarget | PBXAggregateTarget | PBXLegacyTarget
  ) {
    if (developmentTeamId) {
      target.props.buildConfigurationList.props.buildConfigurations.forEach(
        (config) => {
          // @ts-expect-error
          config.props.buildSettings.DEVELOPMENT_TEAM = developmentTeamId;
        }
      );
    } else {
      target.props.buildConfigurationList.props.buildConfigurations.forEach(
        (config) => {
          delete config.props.buildSettings.DEVELOPMENT_TEAM;
        }
      );
    }
  }

  function applyDevelopmentTeamIdToTargets() {
    project.rootObject.props.targets.forEach((target) => {
      configureTargetWithDevelopmentTeamId(target);
    });

    for (const target of project.rootObject.props.targets) {
      project.rootObject.props.attributes.TargetAttributes ??= {};
      // idk, attempting to prevent EAS Build from failing when it codesigns
      project.rootObject.props.attributes.TargetAttributes[target.uuid] ??= {
        CreatedOnToolsVersion: "14.3",
        ProvisioningStyle: "Automatic",
        // @ts-expect-error
        DevelopmentTeam: developmentTeamId,
      };
    }
  }

  function configureTargetWithEntitlements(target: PBXNativeTarget) {
    const entitlements = globSync("*.entitlements", {
      absolute: true,
      cwd: magicCwd,
    }).map((file) => {
      return PBXBuildFile.create(project, {
        fileRef: PBXFileReference.create(project, {
          path: path.basename(file),
          explicitFileType: "text.plist.entitlements",
          sourceTree: "<group>",
        }),
      });
    });

    if (entitlements.length > 0) {
      target.props.buildConfigurationList.props.buildConfigurations.forEach(
        (config) => {
          config.props.buildSettings.CODE_SIGN_ENTITLEMENTS =
            props.cwd + "/" + entitlements[0].props.fileRef.props.path;
        }
      );
    } else {
      target.props.buildConfigurationList.props.buildConfigurations.forEach(
        (config) => {
          delete config.props.buildSettings.CODE_SIGN_ENTITLEMENTS;
        }
      );
    }

    return entitlements;
    // CODE_SIGN_ENTITLEMENTS = MattermostShare/MattermostShare.entitlements;
  }

  function configureTargetWithMarketingVersion(
    target: PBXNativeTarget,
    mainVersion: string
  ) {
    target.props.buildConfigurationList.props.buildConfigurations.forEach(
      (config) => {
        config.props.buildSettings.MARKETING_VERSION = mainVersion;
      }
    );
  }

  function syncMarketingVersions() {
    const mainVersion = getMainMarketingVersion(project);
    // console.log('main marketing version:', mainVersion)
    project.rootObject.props.targets.forEach((target) => {
      if (PBXNativeTarget.is(target)) {
        configureTargetWithMarketingVersion(target, mainVersion);
      }
    });
  }

  function configureTargetWithPreview(target: PBXNativeTarget) {
    const assets = globSync("preview/*.xcassets", {
      absolute: true,
      cwd: magicCwd,
    })[0];

    if (assets) {
      target.props.buildConfigurationList.props.buildConfigurations.forEach(
        (config) => {
          config.props.buildSettings.DEVELOPMENT_ASSET_PATHS = `"${
            props.cwd + "/preview"
          }"`;
        }
      );
    } else {
      target.props.buildConfigurationList.props.buildConfigurations.forEach(
        (config) => {
          delete config.props.buildSettings.DEVELOPMENT_ASSET_PATHS;
        }
      );
    }

    return assets;
  }

  if (targetToUpdate) {
    // Remove existing build phases
    targetToUpdate.props.buildConfigurationList.props.buildConfigurations.forEach(
      (config) => {
        config.getReferrers().forEach((ref) => {
          ref.removeReference(config.uuid);
        });
        config.removeFromProject();
      }
    );
    // Remove existing build configuration list
    targetToUpdate.props.buildConfigurationList
      .getReferrers()
      .forEach((ref) => {
        ref.removeReference(targetToUpdate.props.buildConfigurationList.uuid);
      });
    targetToUpdate.props.buildConfigurationList.removeFromProject();

    // Create new build phases
    targetToUpdate.props.buildConfigurationList =
      createConfigurationListForType(project, props);

    configureTargetWithEntitlements(targetToUpdate);

    configureTargetWithPreview(targetToUpdate);

    applyDevelopmentTeamIdToTargets();

    syncMarketingVersions();
    return project;
  }

  // Build Files

  // NOTE: Single-level only
  const swiftFiles = globSync("*.swift", {
    absolute: true,
    cwd: magicCwd,
  }).map((file) => {
    return PBXBuildFile.create(project, {
      fileRef: PBXFileReference.create(project, {
        path: path.basename(file),
        sourceTree: "<group>",
      }),
    });
  });

  // NOTE: Single-level only
  const intentFiles = globSync("*.intentdefinition", {
    absolute: true,
    cwd: magicCwd,
  }).map((file) => {
    return PBXFileReference.create(project, {
      lastKnownFileType: "file.intentdefinition",
      path: path.basename(file),
      sourceTree: "<group>",
    });
  });

  const intentBuildFiles = [0, 1].map((_) =>
    intentFiles.map((file) => {
      return PBXBuildFile.create(project, {
        fileRef: file,
      });
    })
  );

  let assetFiles = [
    // All assets`
    // "assets/*",
    // NOTE: Single-level only
    "*.xcassets",
  ]
    .map((glob) =>
      globSync(glob, {
        absolute: true,
        cwd: magicCwd,
      }).map((file) => {
        return PBXBuildFile.create(project, {
          fileRef: PBXFileReference.create(project, {
            path: path.basename(file),
            sourceTree: "<group>",
          }),
        });
      })
    )
    .flat();

  const resAssets: PBXBuildFile[] = [];

  // TODO: Maybe just limit this to Safari?
  if (fs.existsSync(path.join(magicCwd, "assets"))) {
    // get top-level directories in `assets/` and append them to assetFiles as folder types
    fs.readdirSync(path.join(magicCwd, "assets")).forEach((file) => {
      if (file === ".DS_Store") return;
      const stat = fs.statSync(path.join(magicCwd, "assets", file));
      if (stat.isDirectory()) {
        resAssets.push(
          PBXBuildFile.create(project, {
            fileRef: PBXFileReference.create(project, {
              path: file,
              sourceTree: "<group>",
              lastKnownFileType: "folder",
            }),
          })
        );
      } else if (stat.isFile()) {
        resAssets.push(
          PBXBuildFile.create(project, {
            fileRef: PBXFileReference.create(project, {
              path: file,
              explicitFileType: file.endsWith(".js")
                ? "sourcecode.javascript"
                : file.endsWith(".json")
                ? "text.json"
                : file.endsWith(".html")
                ? "text.html"
                : file.endsWith(".css")
                ? "text.css"
                : "text",
              sourceTree: "<group>",
            }),
          })
        );
      }
    });
  }

  const alphaExtensionAppexBf = PBXBuildFile.create(project, {
    fileRef: PBXFileReference.create(project, {
      explicitFileType: "wrapper.app-extension",
      includeInIndex: 0,
      path: productName + ".appex",
      sourceTree: "BUILT_PRODUCTS_DIR",
    }),
    settings: {
      ATTRIBUTES: ["RemoveHeadersOnCopy"],
    },
  });

  project.rootObject.ensureProductGroup().props.children.push(
    // @ts-expect-error
    alphaExtensionAppexBf.props.fileRef
  );

  const widgetTarget = project.rootObject.createNativeTarget({
    buildConfigurationList: createConfigurationListForType(project, props),
    name: productName,
    productName,
    // @ts-expect-error
    productReference:
      alphaExtensionAppexBf.props.fileRef /* alphaExtension.appex */,
    productType: productTypeForType(props.type),
  });

  const entitlementFiles = configureTargetWithEntitlements(widgetTarget);

  configureTargetWithPreview(widgetTarget);

  // CD0706062A2EBE2E009C1192
  widgetTarget.createBuildPhase(PBXSourcesBuildPhase, {
    files: [...swiftFiles, ...intentBuildFiles[0], ...entitlementFiles],
    // CD0706152A2EBE2E009C1192 /* index.swift in Sources */,
    // CD07061A2A2EBE2F009C1192 /* alpha.intentdefinition in Sources */,
    // CD0706112A2EBE2E009C1192 /* alphaBundle.swift in Sources */,
    // CD0706132A2EBE2E009C1192 /* alphaLiveActivity.swift in Sources */,
  });

  widgetTarget.createBuildPhase(PBXFrameworksBuildPhase, {
    files: props.frameworks.map((framework) =>
      getOrCreateBuildFile(getFramework(framework))
    ),
  });

  widgetTarget.createBuildPhase(PBXResourcesBuildPhase, {
    files: [...assetFiles, ...resAssets],
  });
  const containerItemProxy = PBXContainerItemProxy.create(project, {
    containerPortal: project.rootObject,
    proxyType: 1,
    remoteGlobalIDString: widgetTarget.uuid,
    remoteInfo: productName,
  });

  const targetDependency = PBXTargetDependency.create(project, {
    target: widgetTarget,
    targetProxy: containerItemProxy,
  });

  // Add the target dependency to the main app, should be only one.
  mainAppTarget.props.dependencies.push(targetDependency);

  const WELL_KNOWN_COPY_EXTENSIONS_NAME =
    props.type === "clip"
      ? "Embed App Clips"
      : props.type === "watch"
      ? "Embed Watch Content"
      : "Embed Foundation Extensions";
  // Could exist from a Share Extension
  const copyFilesBuildPhase = mainAppTarget.props.buildPhases.find((phase) => {
    if (PBXCopyFilesBuildPhase.is(phase)) {
      // TODO: maybe there's a safer way to do this? The name is not a good identifier.
      return phase.props.name === WELL_KNOWN_COPY_EXTENSIONS_NAME;
    }
  });

  if (copyFilesBuildPhase) {
    // Assume that this is the first run if there is no matching target that we identified from a previous run.
    copyFilesBuildPhase.props.files.push(alphaExtensionAppexBf);
  } else {
    // @ts-expect-error
    const dstPath = { clip: "AppClips", watch: "Watch" }[props.type];
    if (dstPath) {
      mainAppTarget.createBuildPhase(PBXCopyFilesBuildPhase, {
        dstPath: "$(CONTENTS_FOLDER_PATH)/" + dstPath,
        dstSubfolderSpec: 16,
        buildActionMask: 2147483647,
        files: [alphaExtensionAppexBf],
        name: WELL_KNOWN_COPY_EXTENSIONS_NAME,
        runOnlyForDeploymentPostprocessing: 0,
      });
    } else {
      mainAppTarget.createBuildPhase(PBXCopyFilesBuildPhase, {
        dstPath: "",
        dstSubfolderSpec: 13,
        buildActionMask: 2147483647,
        files: [alphaExtensionAppexBf],
        name: WELL_KNOWN_COPY_EXTENSIONS_NAME,
        runOnlyForDeploymentPostprocessing: 0,
      });
    }
  }

  const mainSourcesBuildPhase =
    mainAppTarget.getBuildPhase(PBXSourcesBuildPhase);
  // TODO: Idempotent
  mainSourcesBuildPhase?.props.files.push(...intentBuildFiles[1]);

  const protectedGroup = ensureProtectedGroup(project).createGroup({
    // This is where it gets fancy
    // TODO: The user should be able to know that this is safe to modify and won't be overwritten.
    name: path.basename(props.cwd),
    // Like `../alpha`
    path: props.cwd,
    sourceTree: "<group>",
    children: [
      // @ts-expect-error
      ...swiftFiles
        .map((buildFile) => buildFile.props.fileRef)
        .sort((a, b) => a.getDisplayName().localeCompare(b.getDisplayName())),

      // @ts-expect-error
      ...intentFiles.sort((a, b) =>
        a.getDisplayName().localeCompare(b.getDisplayName())
      ),

      // @ts-expect-error
      ...assetFiles
        .map((buildFile) => buildFile.props.fileRef)
        .sort((a, b) => a.getDisplayName().localeCompare(b.getDisplayName())),

      // @ts-expect-error
      ...entitlementFiles
        .map((buildFile) => buildFile.props.fileRef)
        .sort((a, b) => a.getDisplayName().localeCompare(b.getDisplayName())),

      // CD0706192A2EBE2F009C1192 /* Info.plist */ = {isa = PBXFileReference; lastKnownFileType = text.plist.xml; path = Info.plist; sourceTree = "<group>"; };
      // @ts-expect-error
      PBXFileReference.create(project, {
        path: "Info.plist",
        sourceTree: "<group>",
      }),
    ],
    // children = (
    //   CD0706102A2EBE2E009C1192 /* alphaBundle.swift */,
    //   CD0706122A2EBE2E009C1192 /* alphaLiveActivity.swift */,
    //   CD0706142A2EBE2E009C1192 /* index.swift */,
    //   CD0706162A2EBE2E009C1192 /* alpha.intentdefinition */,
    //   CD0706172A2EBE2F009C1192 /* Assets.xcassets */,
    //   CD0706192A2EBE2F009C1192 /* Info.plist */,
    // );
    // name = "expo:alpha";
    // path = "../alpha";
    // sourceTree = "<group>";
  });

  if (resAssets.length > 0) {
    protectedGroup.createGroup({
      name: "assets",
      path: "assets",
      sourceTree: "<group>",
      // @ts-expect-error
      children: resAssets
        .map((buildFile) => buildFile.props.fileRef)
        .sort((a, b) => a.getDisplayName().localeCompare(b.getDisplayName())),
    });
  }

  applyDevelopmentTeamIdToTargets();
  syncMarketingVersions();
  return project;
}

const PROTECTED_GROUP_NAME = "expo:targets";

function ensureProtectedGroup(project: XcodeProject) {
  const hasProtectedGroup = project.rootObject.props.mainGroup
    .getChildGroups()
    .find((group) => group.getDisplayName() === PROTECTED_GROUP_NAME);

  const protectedGroup =
    hasProtectedGroup ??
    PBXGroup.create(project, {
      name: PROTECTED_GROUP_NAME,
      sourceTree: "<group>",
    });

  if (!hasProtectedGroup) {
    project.rootObject.props.mainGroup.props.children.unshift(protectedGroup);

    // let libIndex = project.rootObject.props.mainGroup
    //   .getChildGroups()
    //   .findIndex((group) => group.getDisplayName() === "Libraries");
    // if (libIndex === -1) {
    //   libIndex = 0;
    // }
    // add above the group named "Libraries"
    // project.rootObject.props.mainGroup.props.children.splice(
    //   libIndex,
    //   0,
    //   protectedGroup
    // );
  }

  return protectedGroup;
}
