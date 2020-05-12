import React from 'react';
import '../App.css';
import '../css/common.css'
import axios from 'axios';
import { config } from "../config.js";
var route = require('../img/route.jpg');

//This has turned into a front page. Apparently
//it's not a form component anymore. Oh well.

class Signup extends React.Component {
  constructor(props) {
    super(props);


  }

  state = {
    email: "",
    id: ""
  };

  handleSignupSubmit(event) {
    event.preventDefault();
    var name = document.getElementById("name").value;
    var email = document.getElementById("email").value;
    var marathon = document.getElementById("marathon").value;
    this.setState({ email: email });
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("error").style.display = "none";
    document.getElementById("emailSent").style.display = "none";
    axios.get(`${config.api}/signup?name=${name}&email=${email}&marathon=${marathon}`).then(res => {
      console.log(res.data);
      if (res.data == "oop") {
        document.getElementById("error").style.display = "block";
      } else {
        this.setState({ id: res.data });
        document.getElementById("emailSent").style.display = "block";
      }
    })
  }

  handleFormChange(event) { }

  render() {
    return (
      <div className="App">
        <div className="introText">
          <p>Skate the Bay is a virtual skate marathon hosted by <a href="https://rrderby.org" target="_new">Resurrection Roller Derby</a>, open to skaters everywhere.
          The route comes in three types: Mini, which is equivalent to traveling across the Golden Gate Bridge and back; Bridging, which simulates going around the San Francisco Bay,
          across the Golden Gate, Richmond and Bay bridges; and the Full Bay, which goes around the San Francisco and San Pablo bays. There's no entry fee for participation, but we
          encourage any skaters who can to donate to their local food bank. You can visit <a href="https://www.feedingamerica.org/find-your-local-foodbank" target="_new">Feeding America </a>
          to find yours.
          <br />
            <br />
          To sign up through our site, enter your email and name below, selecting your preffered route. You'll get an email link to your personal dashboard where you can update miles and see
          your progress. Join our <a href="https://www.facebook.com/groups/193465021655844/" target="_new">Facebook group</a> and tag your photos with #SkateTheBay to share with other participants.
          </p>
        </div>

        <h1>Sign Up</h1>
        <p>Enter your email, name (optional) and select your preferred marathon to sign up. The marathon choice can be changed later. You'll get an email with a link to your personal dashboard.</p>
        <form onSubmit={this.handleSignupSubmit.bind(this)}>
          <label><span> Name:{" "}</span>
            <input type="text" id="name" />
          </label>
          <br />
          <label> <span>Email:{" "}</span>
            <input type="email" id="email"></input>
          </label>
          <br />
          <label><span>Marathon:{" "}</span>
            <select id="marathon" defaultValue="bridging">
              <option value="fullBay">Full Bay (155 miles)</option>
              <option value="bridging">Bridging (42 miles)</option>
              <option value="mini">Mini Marathon (3.4 miles)</option>
            </select></label>
          <br /><br />
          <input type="submit" value="Submit" />
        </form>
        <br />
        <br />
        <div id="emailSent" style={{ display: "none" }}><p>Your registration was received. Please check your email, {this.state.email}, for a confirmation and link to your dashboard.</p>
          <p>Your dashboard can be found at: <a href={"https://marathon.rrderby.org/dashboard?id=" + this.state.id}>https://marathon.rrderby.org/dashboard?id={this.state.id}</a>. Be sure to save this link.
          </p>
        </div>
        <div id="error" style={{ display: "none" }}><p>An error occured. Please try again later. If it continues, email <a href="mailto:admin@rrderby.org">admin@rrderby.org</a>.</p></div>
        <br /><br />
        <img src={route}></img>
        <br /><br />
      </div>
    );
  }
}

export default Signup;
