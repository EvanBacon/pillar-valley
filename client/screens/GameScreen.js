import React from 'react';

import Game from '../components/Game';
import Loading from '../components/Loading';
import Song from '../components/Song';

class GameScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };
  state = {
    loading: true,
  };

  render() {
    return (
      <Song>
        <Loading loading={this.state.loading}>
          <Game
            navigation={this.props.navigation}
            onLoad={() => this.setState({ loading: false })}
          />
        </Loading>
      </Song>
    );
  }
}
export default GameScreen;
