import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ProfileMetaDataView({
  name,
  createdAt,
}: {
  name: string;
  createdAt: number;
}) {
  let _name = name || "";
  if (typeof name === "string") {
    _name = _name.trim();
  }
  return (
    <View style={styles.container}>
      <Text style={styles.paragraph}>{_name}</Text>
      {false && (
        <Text style={styles.subtitle}>
          Plays Nitro Roll, Sunset Cyberspace, and Pillar Valley
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    justifyContent: "center",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
    maxWidth: "80%",
  },
  paragraph: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#34495e",
  },
});
