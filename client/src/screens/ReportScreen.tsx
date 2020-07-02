import MaterialIcons from "@expo/vector-icons/build/MaterialIcons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import ReportList from "../components/ReportList";
import Offenses from "../constants/Offenses";
import Fire from "../ExpoParty/Fire";

export default function ReportScreen({ navigation, route }) {
  const { username, uid } = route;

  const onPressItem = ({ name }) => {
    Fire.shared.submitComplaint(uid, name);
    navigation.goBack();
    alert("This user will be investigated with surgical precision.");
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <MaterialIcons size={36} color="#34495e" name="security" />
        <Text style={styles.header}>Report {username}</Text>
      </View>
      <ReportList
        data={Offenses}
        onPress={onPressItem}
        title={`What did ${username} do to you?`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    margin: 24,
    marginLeft: 16,
  },
  header: {
    marginLeft: 12,
    marginTop: 4,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#34495e",
  },
});
