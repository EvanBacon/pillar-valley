import { ConfigPlugin } from "expo/config-plugins";

function safeSet(obj: any, key: string, value: any) {
  const segments = key.split(".");
  const last = segments.pop();
  segments.forEach((segment) => {
    if (!obj[segment]) {
      obj[segment] = {};
    }
    obj = obj[segment];
  });
  obj[last!] = value;

  return obj;
}

export const withEASTargets: ConfigPlugin<{
  bundleIdentifier: string;
  targetName: string;
  entitlements?: Record<string, any>;
}> = (config, { bundleIdentifier, targetName, entitlements }) => {
  // Extra EAS targets
  safeSet(config, "extra.eas.build.experimental.ios.appExtensions", []);

  const existing =
    config.extra!.eas.build.experimental.ios.appExtensions.findIndex(
      (ext: any) => ext.targetName === targetName
    );

  if (existing > -1) {
    config.extra!.eas.build.experimental.ios.appExtensions[existing] = {
      ...config.extra!.eas.build.experimental.ios.appExtensions[existing],
      bundleIdentifier,
      entitlements: {
        ...config.extra!.eas.build.experimental.ios.appExtensions[existing]
          .entitlements,
        ...entitlements,
      },
    };
  } else {
    config.extra!.eas.build.experimental.ios.appExtensions.push({
      bundleIdentifier,
      targetName,
      entitlements,
    });

    // "appExtensions": [
    //   {
    //     "targetName": "widgets",
    //     "bundleIdentifier": "com.evanbacon.pillarvalley.widgets",
    //     "entitlements": {
    //       "com.apple.security.application-groups": [
    //         "group.bacon.data"
    //       ]
    //     }
    //   }
    // ]
  }

  return config;
};
