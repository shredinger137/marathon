import React from 'react';
import '../App.css';
import '../css/common.css'
import axios from 'axios';
import '../components/Signup';
import { config } from "../config.js";


class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.initDate = this.initDate.bind(this);
    }

    state = {
        userData: {
            progress: {}
        },
        progressTotal: 0,
        progressTotalPercent: 0,
        id: ""
    };

    componentDidMount() {
        this.getID();
        this.initDate();
    }

    initDate() {
        var d = new Date();
        var month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        document.getElementById('date').value = [year, month, day].join('-');

    }

    handleAddMiles(event) {
        event.preventDefault();
        var newMiles = document.getElementById("addMiles").value;
        document.getElementById("addMiles").value = "";
        var newDate = document.getElementById("date").value;
        this.initDate();
        axios.get(`${config.api}/updateprogress?user=${this.state.id}&distance=${newMiles}&date=${newDate}`).then(res => this.getID())
    }

    getID() {
        const params = new URLSearchParams(window.location.search);
        if (params && params.get("id")) {
            var id = params.get("id");
            this.setState({ id: id });
            axios.get(`${config.api}/userdata?user=${id}`).then(res => {
                if (res.data != "id_not_found") {
                    this.setState({ userData: res.data });
                    console.log(res.data);
                    var progressArray = [];
                    var total = 0;
                    for (var progressDate in this.state.userData.progress) {
                        progressArray.push([progressDate, this.state.userData.progress[progressDate]])
                        total = total + parseFloat(this.state.userData.progress[progressDate]);
                    }
                    total = Math.floor(total * 1000) / 1000;
                    var totalPercent = Math.floor((total / 155) * 10000) / 100;
                    console.log(total);
                    console.log(totalPercent);
                    if (totalPercent > 100) { totalPercent = 100 }
                    if (totalPercent < 5) { document.getElementById("progressText").style.display = "none"; }
                    else { document.getElementById("progressText").style.display = "block"; }

                    this.setState({
                        progressTotal: total,
                        progressTotalPercent: totalPercent
                    });
                } else { this.handleNotFound(); }

            })
        } else { console.log("id not found"); }
    }

    handleNotFound() {
        document.getElementById("notFound").style.display = "block";
        document.getElementById("updateMilesForm").style.display = "none";
    }
    s
    render() {



        return (
            <div className="App">
                <h1>Dashboard</h1>
                <div>
                    <div id="progress">

                        <div id="progressBar" style={{ width: this.state.progressTotalPercent + "%"}}>
                            <span id="progressText" style={{width: "50vw"}}>{this.state.progressTotal} / 155</span>
                        </div>
                    </div>
                    <br />
                    <br />
                    <form id="updateMilesForm" onSubmit={this.handleAddMiles.bind(this)}>
                        <p>Enter the distance you've skated and the date you did it (it should already have today's date) to update your progress. If you made an entry by mistake, enter a '0' for that date to remove it.</p>
                        <label htmlFor="addMiles"><span>Distance (miles):{" "}</span></label>
                        <input id="addMiles"></input>
                        <label htmlFor="date"><span>Date:{" "}</span></label>
                        <input id="date" type="date"></input>
                        <br />
                        <button type="submit">Submit</button>
                    </form>
                    <br />
                    <br />
                    <div>
                        <span>Total: {this.state.progressTotal} / 155 Miles</span>
                        <br /><br />
                    </div>
                    {Object.keys(this.state.userData.progress).map(
                        date => (
                            <div>
                                <span>{date.replace("2020-", "")}:{"  "}</span><span>{"  "}{this.state.userData.progress[date]} Miles</span>
                            </div>
                        )

                    )}
                    <div id="notFound" style={{ display: "none" }}><p>The requested ID was not found. Please check your email for the correct link, or write to <a href="mailto:admin@rrderby.org">admin@rrderby.org</a> for help.</p></div>
                </div>
            </div>
        );
    }
}

export default Dashboard;
