import Head from "expo-router/head";
import { View, Text } from "react-native";

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy | Pillar Valley</title>
      </Head>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "white" }}>Welcome privacy lovers</Text>
      </View>
    </>
  );
}
