import createRematchPersist, { getPersistor } from "@rematch/persist";
import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/es/integration/react";

import { store } from "./store";

class Gate extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <PersistGate persistor={getPersistor()}>
          {this.props.children}
        </PersistGate>
      </Provider>
    );
  }
}

export default Gate;
