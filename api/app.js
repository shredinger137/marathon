var mongo = require("mongodb");
var express = require("express");
var app = express();
var allowedOrigins = ["https://marathon.rrderby.org", "http://marathon.rrderby.org", "https://locahost:3000", "https://localhost", "https://rrderby.org", "http://localhost:3000", "http://127.0.0.1:3000"];
var mongourl = "mongodb://localhost:27017";


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
        var id = Math.random().toString(36).slice(2);
        checkUserData(id, userEmail).then(checkResult => {
            console.log(checkResult);
            if (checkResult == true) {
                addNewUserToDatabase(userEmail, userDisplayName, id);
                sendEmailToUser(userEmail, id);
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
            console.log(result);
            res.send(result);
        })
    } else { res.send("Invalid query"); }
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
    console.log(id + distance + date);

});


async function getUserData(id) {
    var db = await mongo.connect(mongourl);
    var dbo = db.db("marathon");
    return await dbo.collection("users").findOne({ ID: id });

}


function recoverID(email) {

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

function sendEmailToUser(userEmail, id) {

}


function updateProgress() {

}

//TODO: This currently doesn't have any validation, including if users are already signed up.
//Not sure if we care about that, but we probably do care about bot signups and the like.

function addNewUserToDatabase(userEmail, userDisplayName, userID, options) {
    var userData = {
        email: userEmail,
        name: userDisplayName,
        ID: userID,
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