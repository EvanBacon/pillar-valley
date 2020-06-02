// @flow
import PropTypes from "prop-types";
import React from "react";

import AchievementToast from "../components/AchievementToast";

export default class AchievementToastProvider extends React.Component {
  static propTypes = {
    children: PropTypes.any,
  };

  static childContextTypes = {
    showAchievementToastWithOptions: PropTypes.func,
  };

  getChildContext() {
    return {
      showAchievementToastWithOptions: (...args) =>
        this.ref.showAchievementToastWithOptions(...args),
    };
  }

  render() {
    return (
      <AchievementToast ref={(component) => (this.ref = component)}>
        {this.props.children}
      </AchievementToast>
    );
  }
}
