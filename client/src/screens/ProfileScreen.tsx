import { dispatch } from "../rematch/store";
import React from "react";
import { StyleSheet, View } from "react-native";
import { connect } from "react-redux";

import ProfileImage from "../components/ProfileImage";
import ProfileMetaDataView from "../components/ProfileMetaDataView";
import UpgradeAccountView from "../components/UpgradeAccountView";
import Fire from "../ExpoParty/Fire";
import { connectActionSheet } from "@expo/react-native-action-sheet";

function ProfileScreen({ user = {} }) {
  const isSignedInWithFB = !!user.fbuid;

  // const canUpgrade = this.isUser && !isSignedInWithFB;
  const canLogout = isSignedInWithFB;
  const name = user.displayName || user.deviceName;
  const createdAt = user.createdAt || user.lastRewardTimestamp;
  const isUser = Fire.uid === user.uid;

  const image = isSignedInWithFB
    ? `https://graph.facebook.com/${user.fbuid}/picture?type=large`
    : user.photoURL;

  React.useEffect(() => {
    dispatch.players.getAsync({ uid: user.uid });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <ProfileImage isUser={isUser} name={name} image={image} />
        <ProfileMetaDataView name={name} createdAt={createdAt} />
      </View>

      {isUser && <UpgradeAccountView canLogout={canLogout} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  reportButton: {
    fontWeight: "bold",
    marginRight: 12,
    color: "white",
  },
});

const ASProfile = connectActionSheet(ProfileScreen);

export default connect(
  ({ players }) => ({ players }),
  {},
  ({ players = {}, ...stateProps }, dispatchProps, ownProps) => {
    const uid = ownProps.route.uid || Fire.uid;
    const user = players[uid];

    return {
      ...ownProps,
      ...dispatchProps,
      ...stateProps,
      uid,
      user,
    };
  }
)(ASProfile);
