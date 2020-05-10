var mongo = require("mongodb");
var express = require("express");
var app = express();
var allowedOrigins = ["https://marathon.rrderby.org", "https://locahost:3000", "https://localhost", "https://rrderby.org", "http://localhost:3000", "http://127.0.0.1:3000"];
var mongourl = "mongodb://localhost:27017";


//*****************
//Express Routes
//*****************

//We're going to say that optional fields get a null value;

app.get("/signup", function (req, res) {

    if (req.headers.origin && req.headers.origin != undefined) {
        var origin = req.headers.origin;
        if (allowedOrigins.indexOf(origin) > -1) {
            res.setHeader('Access-Control-Allow-Origin', origin);
        }

    } else { res.setHeader('Access-Control-Allow-Origin', 'https://marathon.rrderby.org'); }
    res.setHeader("Content-Type", "text/plain");

    if (req && req.query && req.query.email) {
        var userEmail = req.query.email;
        var userDisplayName = req.query.name;
        var id = Math.random().toString(36).slice(2);
        checkUserData(id, userEmail).then(checkResult => {
            console.log(checkResult);
            if(checkResult == true){
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

    if (req.headers.origin && req.headers.origin != undefined) {
        var origin = req.headers.origin;
        if (allowedOrigins.indexOf(origin) > -1) {
            res.setHeader('Access-Control-Allow-Origin', origin);
        }

    } else { res.setHeader('Access-Control-Allow-Origin', 'https://marathon.rrderby.org'); }
    res.setHeader("Content-Type", "text/plain");

    if (req && req.query && req.query.user) {
        var id = req.query.user;
        getUserData(id).then(results => {
            res.send(results);
        })
    } else {res.send("Invalid query");}
});

function getUserData(id){
    mongo.connect(
        mongourl,
        { useNewUrlParser: true, useUnifiedTopology: true },
        function (err, db) {
          if (err) throw err;
          var dbo = db.db("marathon");
          dbo
            .collection("users")
            .findOne({"id": userEmail}, function (err, result) {
              if (err) {
                console.log(err);
              }
              if (result) {
                  if(result.length && result.length > 0){
                      return false;
                  } else {
                      return true;
                  }
              }
            }
          );
        }
      );
}

function recoverID(email){

}


//TODO: Maybe todo. This doesn't check ID, but 52 bit entropy means we're probably okay.
async function checkUserData(id, userEmail){
    var db = await mongo.connect(mongourl);
    var dbo = db.db("marathon");
    var results = await dbo.collection("users").find({email: userEmail}).toArray();
    if(results.length > 0){
        return false;
    } else {return true;}
}

function sendEmailToUser(userEmail, id){

}


function updateProgress(){

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