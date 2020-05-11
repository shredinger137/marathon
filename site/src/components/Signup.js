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
    var marathon = document.getElementById("marathon").value;
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("error").style.display = "none";
    document.getElementById("emailSent").style.display = "none";
    axios.get(`${config.api}/signup?name=${name}&email=${email}&marathon=${marathon}`).then(res => {
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
          <p>Enter your email, name (optional) and select your preferred marathon to sign up. The marathon choice can be changed later. You'll get an email with a link to your personal dashboard.</p>
          <form onSubmit={this.handleSignupSubmit}>
            <label><span> Name:</span>
              <input type="text" id="name"/>
            </label>
            <br />
            <label> <span>Email: </span>
              <input type="email" id="email"></input>              
            </label>
            <input type="submit" value="Submit" />
            <br />
            <label><span>Marathon:</span>
            <select id="marathon" defaultValue="bridging">
              <option value="fullBay">Full Bay (155 miles)</option>
              <option value="bridging">Bridging (42 miles)</option>
              <option value="mini">Mini Marathon (3.4 miles)</option>  
            </select></label>
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
