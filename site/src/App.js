import React from 'react';
import './App.css';
import './css/common.css'
import { Route, Switch, BrowserRouter  } from "react-router-dom";
import axios from 'axios';
import { config } from "./config.js";
import './components/Signup';
import Signup from './components/Signup';
import Dashboard from './pages/Dashboard';


class App extends React.Component {
  constructor(props) {
    super(props);


  }

  state = {
  };

  render() {
    return (
      <div className="App">
        <h1>Skate the Bay</h1>
          <BrowserRouter>
            <div>
              <Switch>
                <Route path="/dashboard">
                  <Dashboard />
                </Route>
                <Route path="/">
                  <Signup />
                </Route>
              </Switch>
              </div>
          </BrowserRouter>
      </div>
    );
  }
}

export default App;
