import { FontAwesome } from "@expo/vector-icons";
import { dispatch } from "@rematch/core";
import firebase from "firebase/app";
import "firebase/auth";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const LogoutButton = React.forwardRef((props, ref) => {
  return (
    <FontAwesome.Button
      ref={ref}
      name="sign-out"
      backgroundColor="#CA5D6B"
      children="Log Out"
      onPress={() => firebase.auth().signOut()}
      {...props}
    />
  );
});

const FacebookButton = React.forwardRef((props, ref) => {
  return (
    <FontAwesome.Button
      ref={ref}
      name="facebook"
      backgroundColor="#3b5998"
      children="Link with Facebook"
      onPress={() => dispatch.facebook.upgradeAccount()}
      {...props}
    />
  );
});

export default function UpgradeAccountView({ canLogout }) {
  return (
    <View style={styles.container}>
      {!canLogout && (
        <Text style={styles.text}>
          Link your account to access your score and achievements across games
          and devices.
        </Text>
      )}
      {canLogout && <LogoutButton />}
      {!canLogout && <FacebookButton />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "gray",
    paddingTop: 8,
    marginTop: 24,
  },
  text: {
    fontSize: 14,
    marginBottom: 8,
  },
});
