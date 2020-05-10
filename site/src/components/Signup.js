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
    document.getElementById("error").style.display = "none";
    document.getElementById("emailSent").style.display = "none";
    axios.get(`${config.api}/signup?name=${name}&email=${email}`).then(res => {
      console.log(res.data);
      if(res.data == "oop"){
        document.getElementById("error").style.display = "block";
      } else {
        document.getElementById("emailSent").style.display = "block";
      }
    })
  }

  handleFormChange(event){}

  render() {
    return (
      <div className="App">
          <h1>Sign Up</h1>
          <form onSubmit={this.handleSignupSubmit}>
            <label><span> Name:</span>
              <input type="text" id="name"/>
            </label>
            <br />
            <label> <span>Email: </span>
              <input type="email" id="email"></input>              
            </label>
            <input type="submit" value="Submit" />
          </form>
          <br />
          <br />
          <div id="emailSent" style={{display: "none"}}><p>Your registration was received. Please check your email for a confirmation and link to your dashboard.</p></div>
          <div id="error" style={{display: "none"}}><p>An error occured. Please try again later. If it continues, email <a href="mailto:admin@rrderby.org">admin@rrderby.org</a>.</p></div>
      </div>
    );
  }
}

export default Signup;
