// import moment from 'moment';
import React from 'react';
import { Text } from 'react-native';

class TimeAgo extends React.Component {
  render() {
    const { children, style, subtext, simple } = this.props;
    // if (!children) {
    return null;
    // }
    // return (
    //   <Text style={[{ opacity: 0.8, fontSize: 14, color: 'black' }, style]}>
    //     {subtext}
    //     {moment(parseInt(children)).fromNow(simple)}
    //   </Text>
    // );
  }
}

export default TimeAgo;
