import { dispatch } from '@rematch/core';
import React from 'react';
import { connect } from 'react-redux';

import Icon from './Icon';

class Sound extends React.Component {
  onPress = () => {
    dispatch.muted.toggle();
    if (this.props.onPress) this.props.onPress();
  };
  render() {
    const {
      onPress, name, muted, ...props
    } = this.props;
    const iconName = muted ? 'volume-off' : 'volume-up';
    return <Icon onPress={this.onPress} name={iconName} {...props} />;
  }
}

export default connect(({ muted }) => ({ muted }))(Sound);
