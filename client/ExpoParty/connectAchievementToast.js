import hoistStatics from 'hoist-non-react-statics';
import React from 'react';
import PropTypes from 'prop-types';

export default function connectComponent(WrappedComponent) {
  const ConnectedComponent = (props, context) => {
    return (
      <WrappedComponent
        {...props}
        showAchievementToastWithOptions={context.showAchievementToastWithOptions}
      />
    );
  };

  ConnectedComponent.contextTypes = {
    showAchievementToastWithOptions: PropTypes.func,
  };

  return hoistStatics(ConnectedComponent, WrappedComponent);
}