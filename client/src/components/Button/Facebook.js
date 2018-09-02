// @flow
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';

import createIconButtonComponent from './createIconButtonComponent';

const Button = createIconButtonComponent(FontAwesome);

class Facebook extends React.Component {
  render() {
    return <Button name="facebook" backgroundColor="#3b5998" {...this.props} />;
  }
}

export default Facebook;
