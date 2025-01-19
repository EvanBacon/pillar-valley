// import Constants from "expo-constants";
import React from "react";

// const manifest =
//   Constants.expoConfig || Constants.manifest2 || Constants.manifest;
// const origin =
//   // @ts-expect-error
//   manifest?.extra?.router?.headOrigin ?? manifest?.extra?.router?.origin;

export const InstallBanner = React.forwardRef(function InstallBanner(
  {
    id,
    appClipBundleId,
    appClipDisplay = "card",
  }: { id: string; appClipBundleId?: string; appClipDisplay?: string },
  ref: React.Ref<HTMLMetaElement>
) {
  // if (typeof window === "undefined") {
  //   return null;
  // }

  //   return null;

  // TODO: Use fully qualified URL with maximum info for rehydration (i.e. add groups)
  // const pathname = "/"; // usePathname();

  // const url = React.useMemo(() => {
  //   const url = new URL(
  //     pathname,
  //     typeof window === "undefined"
  //       ? origin ?? "https://acme.com"
  //       : window.location.href
  //   );
  //   // url.searchParams.set("utm_medium", "banner");
  //   // url.searchParams.set("utm_content", "apple-itunes-app");
  //   return url.toString();
  // }, [pathname]);

  if (process.env.NODE_ENV !== "production") {
    if (!id.match(/^\d+$/)) {
      console.warn(
        `InstallBanner: Invalid iTunes App Store ID "${id}". Must be a number.`
      );
    }
  }

  const content = [`app-id=${id}`];
  if (appClipBundleId) {
    content.push(`app-clip-bundle-id=${appClipBundleId}`);
    if (appClipDisplay) {
      content.push(`app-clip-display=${appClipDisplay}`);
    }
  }

  return (
    <meta
      ref={ref}
      name="apple-itunes-app"
      content={content.join(", ")}
      // content={`app-id=${id}, app-argument=${url}`}
    />
  );
});
