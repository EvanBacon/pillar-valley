import * as React from "react";
import { Image, Platform, View, Text, FlatList } from "react-native";
import { A } from "@expo/html-elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Animatable from "react-native-animatable";
import Settings from "../constants/Settings";
import Data from "../constants/Licenses";
import LicensesListItem from "./LicensesListItem";

function extractNameFromGithubUrl(url) {
  if (!url) {
    return null;
  }

  const reg = /((https?:\/\/)?(www\.)?github\.com\/)?(@|#!\/)?([A-Za-z0-9_]{1,15})(\/([-a-z]{1,20}))?/i;
  const components = reg.exec(url);

  const { length, [length - 1]: last } = components;
  return last;
  // if (components && components.length > 5) {
  //   return components[5];
  // }
  // return null;
}

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

  const reg = /((https?:\/\/)?(www\.)?github\.com\/)?(@|#!\/)?([A-Za-z0-9_]{1,15})(\/([-a-z]{1,20}))?/i;

  let username = (license.repository || license.licenseUrl)
    .split("https://github.com/")
    .pop()
    .split("/")
    .shift();
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
  const { bottom } = useSafeAreaInsets();
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{ padding: 16, justifyContent: "center", alignItems: "center" }}
      >
        <A
          style={{ fontSize: 36, textAlign: "center", fontWeight: "bold" }}
          href="https://twitter.com/baconbrix"
        >
          Built by Evan Bacon
        </A>
        {!Settings.isPromo && (
          <A
            style={{ fontSize: 36, textAlign: "center" }}
            href="https://github.com/evanbacon/pillar-valley"
          >
            Made with Expo
          </A>
        )}
      </View>
      <FlatList
        style={{ flex: 1 }}
        keyExtractor={({ key }) => key}
        data={licenses}
        contentContainerStyle={{ paddingBottom: bottom }}
        renderItem={({ item }) => <LicensesListItem {...item} />}
      />
      {Platform.OS === "web" && (
        <Animatable.Image
          animation="slideInUp"
          delay={500}
          source={require("../assets/images/evan.png")}
          style={{
            position: Platform.select({ default: "absolute", web: "fixed" }),
            width: "30%",
            height: "30%",
            bottom: 0,
            right: 8,
            resizeMode: "contain",
          }}
        />
      )}
    </View>
  );
}
