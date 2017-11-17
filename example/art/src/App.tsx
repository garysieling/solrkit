import * as React from "react";
import * as styles from "./App.css";

const logo = require("./logo.svg");

class App extends React.Component<{}, {}> {
  public render() {
    return (
      <div className={styles.app}>
        <div className={styles.appHeader}>
          <img src={logo} className={styles.appLogo} alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className={styles.appIntro}>
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
