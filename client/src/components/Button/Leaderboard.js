import React from 'react';

import Icon from './Icon';

class Leaderboard extends React.Component {
  static defaultProps = {
    onPress: () => {},
  };
  render() {
    return <Icon {...this.props} name="trophy" />;
  }
}

export default Leaderboard;
