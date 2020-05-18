import React from 'react';
import '../App.css';
import '../css/common.css'
import {config} from '../config';
import axios from 'axios';

class Stats extends React.Component {

  state = {
    combinedMiles: 0,
    totalUsers: 0,
    distanceByDate: {},
    distanceGraphData: [],
    distanceGraphLabels: [],
    leaderboard: []
  };

  componentDidMount(){
      this.getStats();
  }

  getStats(){
    axios.get(`${config.api}/getstats`).then(res => {
        var statData;
        var graphData = [];
        if(res && res.data && res.data[0]){
            statData = res.data[0];
        }
        if(statData["combinedMiles"]){
            this.setState({combinedMiles: statData["combinedMiles"]});
        }
        if(statData["totalUsers"]){
            this.setState({totalUsers: statData["totalUsers"]});
        }
        if(statData["leaderBoardByDistance"]){
          this.setState({leaderboard: statData["leaderBoardByDistance"]});
        }
        if(statData["distanceByDate"]){
            this.setState({distanceByDate: statData["distanceByDate"]});
            var allDates = Object.keys(statData["distanceByDate"]);
            for(var date of allDates){
                graphData.push(statData.distanceByDate[date]);
            }
            this.setState({distanceGraphData: graphData, distanceGraphLabels: allDates});
        }

    })
  }


  render() {
    console.log(this.state.leaderboard);
    return (
      <div className="App">
          <p>Participants: {this.state.totalUsers}</p>
          <p>Combined Miles: {this.state.combinedMiles}</p>
          <br /><br />
          <span>Note: this page is very much in development.</span>
          <br />
          <h3>Leaderboards</h3>
          <span><b>Overall Distance</b></span>
          <table className="leaderboard">
            <tbody>
            {this.state.leaderboard.map(
                                user => (
                                  <tr key={user.name}>
                                    <td>
                                      <span className="small">{user.name}</span>
                                    </td>
                                    <td><span className="small">{user.totalDistance}{" "}Miles</span></td>
                                  </tr>
                                )

                            )}

            </tbody>  
          </table> 
      </div>
    );
  }
}

export default Stats;
