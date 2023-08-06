import Head from "expo-router/head";
import * as React from "react";

import { CustomList } from "@/src/components/CustomList";

const Data = require("@/src/constants/Licenses");

function sortDataByKey(data, key) {
  data.sort((a, b) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0));
  return data;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const licenses = Object.keys(Data).map((key) => {
  const { licenses, ...license } = Data[key];

  let [name, version] = key.split("@");
  if (key.startsWith("@")) {
    const components = key.split("@");
    name = `@${components[1]}`;
    version = components[2];
  }

  let username = (license.repository || license.licenseUrl)
    .split("https://github.com/")
    .pop()
    .split("/")
    .shift()
    .replace(/^github:/gi, "");

  // extractNameFromGithubUrl(license.repository) ||
  // extractNameFromGithubUrl(license.licenseUrl);

  let userUrl;
  let image;
  if (username) {
    username = capitalizeFirstLetter(username);
    image = `https://github.com/${username}.png`;
    userUrl = `https://github.com/${username}`;
  }

  return {
    key,
    name,
    image,
    userUrl,
    username,
    licenses: licenses.slice(0, 405),
    version,
    ...license,
  };
});

sortDataByKey(licenses, "username");

export default function Licenses() {
  return (
    <>
      <Head>
        <title>Credit</title>
        <meta property="og:title" content="Credit | Pillar Valley" />
      </Head>
      <CustomList
        sections={[
          ...licenses.reduce((prev, curr) => {
            const { username } = curr;
            const item = {
              title: curr.name,
              href: curr.licenseUrl.startsWith("http")
                ? curr.licenseUrl
                : "https://github.com/" +
                  curr.licenseUrl.replace(/^github:/gi, ""),
            };

            const section = prev.find((section) => section.title === username);
            if (section) {
              section.data.push(item);
            } else {
              prev.push({
                title: username,
                data: [item],
              });
            }

            return prev;
          }, []),
          {
            title: "Built by Evan Bacon",
            data: [
              {
                title: "Powered by Expo",
                href: "https://expo.dev",
              },
            ],
          },
        ]}
      />
    </>
  );
}
