import { FontAwesome } from '@expo/vector-icons';
import React from 'react';

class Facebook extends React.Component {
  render() {
    return (
      <FontAwesome.Button
        name="facebook"
        backgroundColor="#3b5998"
        {...this.props}
      />
    );
  }
}

export default Facebook;
