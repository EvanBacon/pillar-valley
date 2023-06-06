import { usePathname } from "expo-router";
import React from "react";
import Constants from "expo-constants";

const manifest =
  Constants.expoConfig || Constants.manifest2 || Constants.manifest;
const origin =
  // @ts-expect-error
  manifest?.extra?.router?.headOrigin ?? manifest?.extra?.router?.origin;

export const InstallBanner = React.forwardRef(function InstallBanner(
  { id }: { id: string },
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
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      if (!id.match(/^\d+$/)) {
        console.warn(
          `InstallBanner: Invalid iTunes App Store ID "${id}". Must be a number.`
        );
      }
    }, [id]);
  }

  return (
    <meta
      ref={ref}
      name="apple-itunes-app"
      content={`app-id=${id}`}
      // content={`app-id=${id}, app-argument=${url}`}
    />
  );
});
