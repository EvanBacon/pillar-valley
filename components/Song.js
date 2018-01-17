import React from 'react';

import AudioManager from '../Manager/AudioManager';
import { connect } from 'react-redux';

class Song extends React.Component {
  async componentWillMount() {
    await AudioManager.sharedInstance.playAsync('song', true);

    const { muted } = this.props;

    if (muted) {
      AudioManager.sharedInstance.pauseAsync('song');
    }
  }
  componentWillUnmount() {
    AudioManager.sharedInstance.stopAsync('song');
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.muted != this.props.muted) {
      if (nextProps.muted) {
        AudioManager.sharedInstance.pauseAsync('song');
      } else {
        AudioManager.sharedInstance.playAsync('song', true, false);
      }
    }
  }

  render() {
    return this.props.children;
  }
}

export default connect(({ muted }) => ({ muted }))(Song);
