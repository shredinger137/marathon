import React from 'react';
import '../App.css';
import '../css/common.css'
import axios from 'axios';
import '../components/Signup';
import { config } from "../config.js";


class Dashboard extends React.Component {
    constructor(props) {
        super(props);
    }

    state = {
        userData: {}
    };

    componentDidMount() {
        this.getID();
    }


    getID() {
        const params = new URLSearchParams(window.location.search);
        if (params && params.get("id")) {
            var id = params.get("id");
            axios.get(`${config.api}/userdata?user=${id}`).then(res => {
                this.setState({ userData: res.data });
            })
        } else { console.log("id not found"); }
    }

    render() {
        return (
            <div className="App">
                <header className="App-header">
                    <h1>Dashboard</h1>
                    <p>{this.state.userData.email}</p>
                </header>
            </div>
        );
    }
}

export default Dashboard;
