import React from 'react';

import Icon from './Icon';

class Licenses extends React.Component {
  static defaultProps = {
    onPress: () => {},
  };
  render() {
    return <Icon {...this.props} name="handshake-o" />;
  }
}

export default Licenses;
