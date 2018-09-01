import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';

const tabBarIcon = name => ({ tintColor }) => (
  <Ionicons style={{ backgroundColor: 'transparent' }} name={`md-${name}`} color={tintColor} size={24} />
);

export default tabBarIcon;
