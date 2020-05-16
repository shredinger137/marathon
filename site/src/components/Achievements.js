import React from 'react';
import '../App.css';
import '../css/common.css'
import { badgeData } from "./achievementsData.js";
var route = require('../img/route.jpg');



class Achievements extends React.Component {
    constructor(props) {
        super(props);
    }

    state = {
        badges: [],
        nextBadge: {},
        showNextBadge: false
    }

    componentDidUpdate(prevprops, prevstate) {
        console.log(prevprops);
        if (prevprops.miles != this.props.miles || prevprops.marathon != this.props.marathon) {
            this.getAllBadges();
        }
    }

    componentDidMount() {
        this.getAllBadges();
    }


    //I got confused on data structures here
    //The key should be the mile marker? 

    getAllBadges() {
        this.setState({ showNextBadge: false })
        console.log(this.props);

        var gotNextBadge = false;

        var allBadges = [];

        if (this.props.marathon == "mini") {
            var list = badgeData.mini;
        }
        if (this.props.marathon == "bridging") {
            var list = badgeData.bridging;
        }
        if (this.props.marathon == "fullBay") {
            var list = badgeData.full;
        }
        console.log(Array.isArray(list));
        if (list && Array.isArray(list) == true) {
            for (var badge of list) {

                //each 'badge' is an object
                //each one has keys name, desc, image, mile

                if (badge.mile && badge.mile <= this.props.miles) {
                    allBadges.push(badge);
                } else {
                    if (gotNextBadge == false) {
                        this.setState({ nextBadge: badge, showNextBadge: true });
                        gotNextBadge = true;
                        break;
                    }
                }
                this.setState({ badges: allBadges });


            }
        }
    }

    render() {
        return (
            <div className="badgeGrid">
                {this.state.badges.map(badge =>
                    <div>
                        <span className="badgeName">{badge.name}</span><br />
                        <img src={`./badges/${badge.image}`} width="150px" alt={`${badge.name}: ${badge.desc}`}></img>
                        <br />
                        <span className="badgeDescription">{badge.desc}</span>
                        <br />
                        <span className="badgeDescription">{badge.mile} Miles</span>
                    </div>
                )}
                {this.state.showNextBadge == true ?
                    <div>
                        <span className="badgeName nextBadge">{this.state.nextBadge.name}</span><br />
                        <img className="nextBadge" src={`./badges/${this.state.nextBadge.image}`} width="150px" alt={`${this.state.nextBadge.name}: ${this.state.nextBadge.desc}`}></img>
                        <br />
                        <span className="badgeDescription nextBadge">{this.state.nextBadge.desc}</span>
                        <br />
                        <span className="badgeDescription">Unlocked at {this.state.nextBadge.mile} Miles</span>
                    </div>
                    :

                    ""

                }




            </div>
        );
    }
}

export default Achievements;
