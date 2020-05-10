import React from 'react';
import '../App.css';
import '../css/common.css'
import { Route, Switch } from "react-router-dom";
import axios from 'axios';
import { config } from "../config.js";


class Signup extends React.Component {
  constructor(props) {
    super(props);


  }

  state = {
  };

  handleSignupSubmit(event) {
    event.preventDefault();
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    axios.get(`${config.api}/signup?name=${name}&email=${email}`).then(res => {
      console.log(res.data);
    })
  }

  handleFormChange(event){}

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Signup</h1>
          <form onSubmit={this.handleSignupSubmit}>
            <label> Name:
              <input type="text" id="name"/>
            </label>
            <label> Email: 
              <input type="text" id="email"></input>              
            </label>
            <input type="submit" value="Submit" />
          </form>

        </header>
      </div>
    );
  }
}

export default Signup;
