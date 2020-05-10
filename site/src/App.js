import React from 'react';
import './App.css';
import './css/common.css'
import { Route, Switch } from "react-router-dom";
import axios from 'axios';
import { config } from "./config.js";
import './components/Signup';
import Signup from './components/Signup';


class App extends React.Component {
  constructor(props) {
    super(props);


  }

  state = {
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <Signup />

        </header>
      </div>
    );
  }
}

export default App;
