import React from 'react';

import Icon from './Icon';

class Cancel extends React.PureComponent {
  render() {
    const { name, ...props } = this.props;
    return <Icon onPress={this.onPress} name="times" {...props} />;
  }
}

export default Cancel;
