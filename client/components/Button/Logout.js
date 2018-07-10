import { FontAwesome } from '@expo/vector-icons';
import React from 'react';

class Logout extends React.Component {
  render() {
    return (
      <FontAwesome.Button
        name="sign-out"
        backgroundColor="#CA5D6B"
        {...this.props}
      />
    );
  }
}

export default Logout;
