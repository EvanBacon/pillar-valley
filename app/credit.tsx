import { A } from "@expo/html-elements";
import * as React from "react";
import { Platform, View } from "react-native";
import * as Animatable from "react-native-animatable";
import { FlatList } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import LicensesListItem from "@/src/components/LicensesListItem";
import Settings from "@/src/constants/Settings";

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
    <View style={{ flex: 1, backgroundColor: "#191A23" }}>
      <View style={{ padding: 16 }}>
        <A
          style={{
            fontSize: 24,
            color: "white",
          }}
          href="https://twitter.com/baconbrix"
        >
          Built by Evan Bacon
        </A>
        {!Settings.isPromo && (
          <A
            style={{ fontSize: 16, color: "white" }}
            href="https://github.com/evanbacon/pillar-valley"
          >
            Powered by Expo
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
          source={require("@/src/assets/images/evan.png")}
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
