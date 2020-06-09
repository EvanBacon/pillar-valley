import hoistStatics from 'hoist-non-react-statics';
import React from 'react';

export default function connectComponent(WrappedComponent) {
  const ConnectedComponent = (props, context) => (
    <WrappedComponent {...props} showAchievementToastWithOptions={context.showAchievementToastWithOptions} />
  );

  return hoistStatics(ConnectedComponent, WrappedComponent);
}
