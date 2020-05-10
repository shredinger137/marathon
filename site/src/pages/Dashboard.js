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
        axios.get(`${config.api}/updateprogress?user=${this.state.id}&distance=${newMiles}&date=${newDate}`)
    }

    getID() {
        const params = new URLSearchParams(window.location.search);
        if (params && params.get("id")) {
            var id = params.get("id");
            this.setState({ id: id });
            axios.get(`${config.api}/userdata?user=${id}`).then(res => {
                this.setState({ userData: res.data });
                console.log(res.data);
                var progressArrayDates = Object.keys(res.data.progress);
                var progressArray = [];
                for (var progressDate in this.state.userData.progress) {
                    progressArray.push([progressDate, this.state.userData.progress[progressDate]])
                }
                console.log(progressArray);

            })
        } else { console.log("id not found"); }
    }

    render() {



        return (
            <div className="App">
                <header className="App-header">
                    <h1>Dashboard</h1>
                    <form onSubmit={this.handleAddMiles.bind(this)}>
                        <input id="addMiles"></input>
                        <input id="date" type="date"></input>
                        <button type="submit">Submit</button>
                    </form>
                    <br />
                    <br />
                    <div></div>
                    {Object.keys(this.state.userData.progress).map(
                        date => (
                            <div>
                                <span>{date}:{"  "}</span><span>{"  "}{this.state.userData.progress[date]} Miles</span>
                            </div>
                        )

                    )}
                    <p>User: {this.state.userData.email}</p>
                </header>
            </div>
        );
    }
}

export default Dashboard;
