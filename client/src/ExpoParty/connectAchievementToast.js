// @flow
import hoistStatics from 'hoist-non-react-statics';
import PropTypes from 'prop-types';
import React from 'react';

export default function connectComponent(WrappedComponent) {
  const ConnectedComponent = (props, context) => (
    <WrappedComponent {...props} showAchievementToastWithOptions={context.showAchievementToastWithOptions} />
  );

  ConnectedComponent.contextTypes = {
    showAchievementToastWithOptions: PropTypes.func,
  };

  return hoistStatics(ConnectedComponent, WrappedComponent);
}
