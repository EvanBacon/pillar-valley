import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';

import AudioManager from '../AudioManager';

class Song extends React.Component {
  static propTypes = {
    muted: PropTypes.bool.isRequired,
    children: View.propTypes.children.isRequired,
  };

  async componentDidMount() {
    // await AudioManager.shared.playAsync('song', true);

    const { muted } = this.props;

    if (muted) {
      AudioManager.shared.pauseAsync('song');
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.muted !== this.props.muted) {
      if (nextProps.muted) {
        AudioManager.shared.pauseAsync('song');
      } else {
        AudioManager.shared.playAsync('song', true, false);
      }
    }
  }

  componentWillUnmount() {
    AudioManager.shared.stopAsync('song');
  }

  render() {
    return this.props.children;
  }
}

export default connect(({ muted }) => ({ muted }))(Song);
