// @flow
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';

import createIconButtonComponent from './createIconButtonComponent';

const Button = createIconButtonComponent(FontAwesome);

export default (props) => <Button name="facebook" backgroundColor="#3b5998" {...props} />;
