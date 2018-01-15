var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var bodyParser = require('body-parser');
var path = require('path');
var mqtt = require('mqtt');
var favicon = require('serve-favicon');

//comment
var client  = mqtt.connect('mqtt:192.168.1.242:1883');
var url = 'mongodb://rob:rob@ds251277.mlab.com:51277/homeautomationdeg';

var ejs = require('ejs');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/views/styles'));

app.use(favicon(path.join(__dirname, 'views','assets','favicon.ico')));

MongoClient.connect(url, function(err, db) {
  console.log("Database: Connected");
  db.close();
});

client.on('connect', function () {
  console.log('MQTT: Connected');
})


app.get('/', function(req, res) {
    res.render('pages/index');
});

app.get('/settings', function(req, res) {

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        db.collection("Days").find().toArray(function(err, result) {
            if (err) throw err;
            db.close();
            //switches days from base zero numbering to actual day names
            for (var i = 0; i < result.length; i++) {
                console.log(result[i].day);
                switch (result[i].day) {
                    case "0":
                        result[i].day = "Sunday";
                        break;
                    case "1":
                        result[i].day = "Monday";
                        break;
                    case "2":
                        result[i].day = "Tuesday";
                        break;
                    case "3":
                        result[i].day = "Wednesday";
                        break;
                    case "4":
                        result[i].day = "Thursday";
                        break;
                    case "5":
                        result[i].day = "Friday";
                        break;
                    case "6":
                        result[i].day = "Saturday";
                }
            }
            res.render('pages/settings', {result: result});
        });
    });

    //res.render('pages/settings');
});

app.post('/settings', function(req, res) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;

        db.collection("Days").insertOne(req.body, function(err, ress) {
            if (err) throw err;
            console.log("1 document inserted");
            db.close();
            res.redirect('/settings');
        });
    });

});

app.get('/delete/:id', function(req, res) {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var myquery = { "_id": ObjectId(req.params.id) };
      //var myquery1 = { "day": "0" };

      db.collection("Days").deleteOne(myquery, function(err, obj) {
        if (err) throw err;
        console.log("1 document deleted");
        db.close();
        res.redirect('/settings');
      });
    });

});

io.on('connection', function(socket) {
    console.log("Connection.");
})

http.listen(3000, function() {
    console.log('Server Running.');
});

setInterval(function() {
    var current = new Date();
    var day = current.getDay();
    var minutes = (current.getMinutes()<10?'0':'') + current.getMinutes() // gets info with leading digit
    var hours = (current.getHours()<10?'0':'') + current.getHours() // gets info with leading digit
    var time = hours + ":" + minutes + ":" + current.getSeconds();
    var seconds = ":0";

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        db.collection("Days").find().toArray(function(err, result) {
            if (err) throw err;
            for (var i = 0; i < result.length; i++) {
                if (day == result[i].day && time == (result[i].time + seconds)) {
                    client.publish(result[i].topic, result[i].status);
                }
            }
            db.close();
        });
    });

    console.log("Day: " + day + " Time: " + time);
}, 1000);
