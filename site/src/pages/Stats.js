import React from 'react';
import '../App.css';
import '../css/common.css'
import {config} from '../config';
import axios from 'axios';

class Stats extends React.Component {
  constructor(props) {
    super(props);


  }

  state = {
    combinedMiles: 0,
    totalUsers: 0,
    distanceByDate: {},
    distanceGraphData: [],
    distanceGraphLabels: []
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
    return (
      <div className="App">
          <p>Participants: {this.state.totalUsers}</p>
          <p>Combined Miles: {this.state.combinedMiles}</p>
      </div>
    );
  }
}

export default Stats;
