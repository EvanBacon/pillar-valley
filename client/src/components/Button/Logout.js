import React from 'react';

import { FontAwesome } from '@expo/vector-icons';

import createIconButtonComponent from './createIconButtonComponent';

const Button = createIconButtonComponent(FontAwesome);

class Logout extends React.Component {
  render() {
    return <Button backgroundColor="#CA5D6B" {...this.props} name="sign-out" />;
  }
}

export default Logout;
