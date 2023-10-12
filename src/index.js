// src/index.js (or index.js)
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { defaultStore } from "./store/index.js";


ReactDOM.render(
  <Provider store={defaultStore.store}>
      <PersistGate persistor={defaultStore.persistor}>
      <DndProvider backend={HTML5Backend}>
        <App />
  </DndProvider>
      </PersistGate>
    </Provider>,
  document.getElementById("root")
);
