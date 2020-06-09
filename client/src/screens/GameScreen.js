import React from "react";

import Game from "../components/Game";
import Loading from "../components/Loading";
import Song from "../components/Song";

function GameScreen({ navigation }) {
  const [loading, setLoading] = React.useState(true);

  return (
    <Song>
      <Loading loading={loading}>
        <Game navigation={navigation} onLoad={() => setLoading(false)} />
      </Loading>
    </Song>
  );
}

GameScreen.navigationOptions = {
  header: null,
};

export default GameScreen;
