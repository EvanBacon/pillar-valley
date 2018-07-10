import React from 'react';
import {
  StyleSheet,
  Text,
  Image,
  TouchableHighlight,
  View,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Avatar from './Avatar';
import Assets from '../Assets';

const ScoreBadge = ({ style, children, color }) => (
  <View
    style={[
      {
        borderRadius: 20,
        backgroundColor: '#4630eb',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 6,
      },
      style,
    ]}
  >
    <Image
      source={Assets.images['expoBadge.png']}
      style={{
        marginRight: 12,
        resizeMode: 'contain',
        tintColor: color,
        width: 20,
        aspectRatio: 1,
      }}
    />
    <Text
      style={{
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 6,
        color: color,
      }}
    >
      {children}
    </Text>
  </View>
);

export default ScoreBadge;
