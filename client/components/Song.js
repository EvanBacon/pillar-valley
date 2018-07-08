import React from 'react';

import AudioManager from '../AudioManager';
import { connect } from 'react-redux';

class Song extends React.Component {
  async componentWillMount() {
    await AudioManager.shared.playAsync('song', true);

    const { muted } = this.props;

    if (muted) {
      AudioManager.shared.pauseAsync('song');
    }
  }
  componentWillUnmount() {
    AudioManager.shared.stopAsync('song');
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.muted != this.props.muted) {
      if (nextProps.muted) {
        AudioManager.shared.pauseAsync('song');
      } else {
        AudioManager.shared.playAsync('song', true, false);
      }
    }
  }

  render() {
    return this.props.children;
  }
}

export default connect(({ muted }) => ({ muted }))(Song);
