var mongo = require("mongodb");
var express = require("express");
var app = express();
var allowedOrigins = ["https://marathon.rrderby.org", "http://marathon.rrderby.org", "https://locahost:3000", "https://localhost", "https://rrderby.org", "http://localhost:3000", "http://127.0.0.1:3000"];
var mongourl = "mongodb://localhost:27017";
var nodemailer = require("nodemailer");
var config = require("./config.js");
var cron = require("node-cron");

cron.schedule("* * * * *", () => {
    generateStats();
    createLeaderboardByTotalDistance();
});

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.emailUsername,
        pass: config.emailPass
    }
});

generateStats();


//*****************
//Express Routes
//*****************

//We're going to say that optional fields get a null value;

app.get("/signup", function (req, res) {

    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/plain");

    if (req && req.query && req.query.email) {
        var userEmail = req.query.email;
        var userDisplayName = req.query.name;
        var marathonSelection = req.query.marathon;
        var id = Math.random().toString(36).slice(2);
        checkUserData(id, userEmail).then(checkResult => {
            if (checkResult == true) {
                addNewUserToDatabase(userEmail, userDisplayName, marathonSelection, id);
                var content = createWelcomeEmail(id);
                sendEmailToUser(userEmail, "Welcome to Skate the Bay", content);
                res.send(id);
            }
            else {
                res.send("oop");
            }
        })
    }
});

app.get("/userdata", function (req, res) {

    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/plain");

    if (req && req.query && req.query.user) {
        var id = req.query.user;
        getUserData(id).then(result => {
            if (result) {
                res.send(result);
            } else {
                res.send("id_not_found");
            }
        })
    } else { res.send("Invalid query"); }
});

app.get("/getallusers", function (req, res) {

    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/plain");
    getAllUserData().then(result => {
        if (result) {
            res.send(result);
        } else {
            res.send("err");
        }
    })

});

app.get("/resend", function (req, res) {

    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/plain");

    if (req && req.query && req.query.email) {
        var email = req.query.email;
        mongo.connect(
            mongourl,
            { useNewUrlParser: true, useUnifiedTopology: true },
            function (err, db) {
                if (err) throw err;
                var dbo = db.db("marathon");
                dbo.collection("users").findOne({ email: email }, function (err, result) {
                    if (err) throw err;
                    else {
                        db.close();
                        var content = createWelcomeEmail(result.ID);
                        sendEmailToUser(email, "Skate the Bay Dashboard Link", content);
                        res.send(result.ID);
                    }
                }
                );
            });
    } else { res.send("Invalid query"); }
});

app.get("/updatemarathon", function (req, res) {

    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/plain");

    if (req && req.query && req.query.user && req.query.marathon) {
        var id = req.query.user;
        var marathon = req.query.marathon;
        mongo.connect(
            mongourl,
            { useNewUrlParser: true, useUnifiedTopology: true },
            function (err, db) {
                if (err) throw err;
                var dbo = db.db("marathon");
                dbo.collection("users").updateOne({ ID: id }, { $set: { marathon: marathon } }, function (err, result) {
                    if (err) throw err;
                    else {
                        res.send("200");
                    }
                    db.close();
                }
                );
            });
    } else { res.send("Invalid query"); }
});

app.get("/getstats", function (req, res) {

    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/plain");
    getStats().then(result => {
        res.send(result);
    })

});

app.get("/updatePublicOption", function (req, res) {

    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/plain");

    var progressData;
    var id = req.query.user;
    var value = req.query.value;

    mongo.connect(
        mongourl,
        { useNewUrlParser: true, useUnifiedTopology: true },
        function (err, db) {
            if (err) throw err;
            var dbo = db.db("marathon");
            dbo.collection("users").updateOne({ ID: id }, { $set: { allowPublic: value } }, { upsert: true }, function (err, result) {
                if (err) throw err;
                else {
                    res.send("200");
                }
                db.close();
            }
            );
        });

});

app.get("/updateprogress", function (req, res) {

    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Type", "text/plain");

    var progressData;
    var id = req.query.user;
    var distance = req.query.distance;
    var date = req.query.date;
    getUserData(id)
        .then(data => {
            progressData = data.progress;
            progressData[date] = distance;
            if (distance == 0) {
                delete progressData[date];
            }

            mongo.connect(
                mongourl,
                { useNewUrlParser: true, useUnifiedTopology: true },
                function (err, db) {
                    if (err) throw err;
                    var dbo = db.db("marathon");
                    dbo.collection("users").updateOne({ ID: id }, { $set: { progress: progressData } }, function (err, result) {
                        if (err) throw err;
                        else {
                            res.send("200");
                        }
                        db.close();
                    }
                    );
                });

        })

});

function updateUserTotal(id, total) {
    mongo.connect(
        mongourl,
        { useNewUrlParser: true, useUnifiedTopology: true },
        function (err, db) {
            if (err) throw err;
            var dbo = db.db("marathon");
            dbo.collection("users").updateOne({ ID: id }, { $set: { totalDistance: total } }, { upsert: true }, function (err, result) {
                if (err) throw err;
                db.close();
            }
            );
        });
}
createLeaderboardByTotalDistance()

async function createLeaderboardByTotalDistance() {
    var db = await mongo.connect(mongourl);
    var dbo = db.db("marathon");
    var allUsers = await dbo.collection("users").find({ allowPublic: "true" }, { projection: { _id: 0, name: 1, totalDistance: 1 } }).limit(30).sort({ totalDistance: -1 }).toArray();
    mongo.connect(
        mongourl,
        { useNewUrlParser: true, useUnifiedTopology: true },
        function (err, db) {
            if (err) throw err;
            var dbo = db.db("marathon");
            dbo.collection("stats").updateOne({ name: "combinedStats" }, { $set: { leaderBoardByDistance: allUsers } }, { upsert: true }, function (err, result) {
                if (err) throw err;
                else {
                    console.log("wrote stats");
                }
                db.close();
            }
            );
        });
}

function generateStats() {
    getAllUserData().then(result => {
        var totalMiles = 0;
        var userCount = 0;
        var distanceByDate = {};
        if (result) {
            //get total miles for all added together. Also update individual totals.
            for (user of result) {
                userCount += 1;
                if (user.progress) {
                    var userTotal = 0;
                    for (date in user.progress) {
                        if (user.progress.date != null && parseFloat(user.progress[date]) != null) {
                            userTotal += parseFloat(user.progress[date]);
                            totalMiles += parseFloat(user.progress[date]);
                        }
                        if (distanceByDate[date] && typeof parseFloat(user.progress[date]) == "number") {
                            distanceByDate[date] += parseFloat(user.progress[date]);
                        } else {
                            if (parseFloat(user.progress[date]) != null) {
                                distanceByDate[date] = parseFloat(user.progress[date]);
                            }
                        }

                    }
                    updateUserTotal(user.ID, userTotal);
                };

            }
            mongo.connect(
                mongourl,
                { useNewUrlParser: true, useUnifiedTopology: true },
                function (err, db) {
                    if (err) throw err;
                    var dbo = db.db("marathon");
                    dbo.collection("stats").updateOne({ name: "combinedStats" }, { $set: { combinedMiles: totalMiles, totalUsers: userCount, distanceByDate: distanceByDate } }, { upsert: true }, function (err, result) {
                        if (err) throw err;
                        else {
                            console.log("wrote stats");
                        }
                        db.close();
                    }
                    );
                });
        } else {
            console.log("err");
        }
    })

}



async function getUserData(id) {
    var db = await mongo.connect(mongourl);
    var dbo = db.db("marathon");
    return await dbo.collection("users").findOne({ ID: id });
}


async function getAllUserData(query) {
    var db = await mongo.connect(mongourl);
    var dbo = db.db("marathon");
    return await dbo.collection("users").find(query).toArray();
}


function createWelcomeEmail(id) {
    var content = `<p>Welcome to the Skate the Bay Marathon!</p>
                    <br /><br />
                    <p>Thank you for signing up for Resurrection Roller Derby's Skate the Bay Virtual Marathon. Your unique dashboard link is: <a href="https://marathon.rrderby.org/dashboard?id=${id}">https://marathon.rrderby.org/dashboard?id=${id}</a>. Use this link to view
                    and update your progress. Be sure to join our Facebook group and tag your photos/Tweets with #SkateTheBay to stay in touch with other skaters. </p>
                    <br />
                    <p>We're encouraging all participants to also get in contact with their local food banks to make donations. They are providing unprecedented support to our community, and we hope the roller derby and skating communities can help then succeed.</p>
        `
    return content;
}


function sendEmailToUser(emailAddress, subject, content) {
    const mailOptions = {
        from: config.emailFrom,
        to: emailAddress,
        subject: subject,
        html: content
    };

    transporter.sendMail(mailOptions, function (err, info) {
        if (err)
            console.log(err)
        else
            console.log(info);
    });
}


//TODO: Maybe todo. This doesn't check ID, but it's random enough that I'd be surprised if this became an issue
async function checkUserData(id, userEmail) {
    var db = await mongo.connect(mongourl);
    var dbo = db.db("marathon");
    var results = await dbo.collection("users").find({ email: userEmail }).toArray();
    if (results.length > 0) {
        return false;
    } else { return true; }
}


async function getStats() {
    var db = await mongo.connect(mongourl);
    var dbo = db.db("marathon");
    var results = await dbo.collection("stats").find({}).toArray();
    if (results.length > 0) {
        return results;
    } else { return false; }
}

//TODO: This currently doesn't have any validation, including if users are already signed up.
//Not sure if we care about that, but we probably do care about bot signups and the like.

function addNewUserToDatabase(userEmail, userDisplayName, marathon, userID, options) {
    var userData = {
        email: userEmail,
        name: userDisplayName,
        ID: userID,
        marathon: marathon,
        progress: {}
    }

    //options not currently implemented, it's a placeholder
    //object for things we might add later 

    mongo.connect(
        mongourl,
        { useNewUrlParser: true, useUnifiedTopology: true },
        function (err, db) {
            if (err) throw err;
            var dbo = db.db("marathon");
            dbo.collection("users").insertOne(userData, function (err, result) {
                if (err) throw err;
                else {


                }
                db.close();
            }
            );
        });

}


app.listen(2222);