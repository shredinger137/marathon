var mongo = require("mongodb");
var express = require("express");
var app = express();
var allowedOrigins = ["https://marathon.rrderby.org", "http://marathon.rrderby.org", "https://locahost:3000", "https://localhost", "https://rrderby.org", "http://localhost:3000", "http://127.0.0.1:3000"];
var mongourl = "mongodb://localhost:27017";
var nodemailer = require("nodemailer");
var config = require("./config.js");

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.emailUsername,
        pass: config.emailPass
    }
});




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
            console.log(checkResult);
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
            if(result){
                res.send(result);
            } else {
                res.send("id_not_found");
            }           
        })
    } else { res.send("Invalid query"); }
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
                dbo.collection("users").findOne({email: email}, function (err, result) {
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
            if(distance == 0){
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
    console.log(id + distance + date);

});


async function getUserData(id) {
    var db = await mongo.connect(mongourl);
    var dbo = db.db("marathon");
    return await dbo.collection("users").findOne({ ID: id });

}


function createWelcomeEmail(id){
    var content = `<h3>Welcome to the Skate the Bay Marathon!</h3>
                    <br /><br />
                    <p>Your unique dashboard link is: <a href="https://marathon.rrderby.org/dashboard?id=${id}">https://marathon.rrderby.org/dashboard?id=${id}</a>. Use this link to view
                    and update your progress.</p>
        `
    return content;
}


function sendEmailToUser(emailAddress, subject, content) {
    const mailOptions = {
        from: config.emailUsername,
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


function updateProgress() {

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