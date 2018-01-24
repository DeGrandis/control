//required imports
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
var ejs = require('ejs');
var helpers = require('./js/serverHelpers.js')

//connect to mqtt server, will be a local IP
var client  = mqtt.connect('mqtt:192.168.1.242:1883');
//url to public mongodb database
var url = 'mongodb://rob:rob@ds251277.mlab.com:51277/homeautomationdeg';

//setting app specific defaults
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/views/styles'));
app.use(favicon(path.join(__dirname, 'views','assets','favicon.ico')));

//test connect to Mongodb
MongoClient.connect(url, function(err, db) {
  console.log("Database: Connected");
  db.close();
});

//test connect to mqtt
client.on('connect', function () {
  console.log('MQTT: Connected');
})

//------------------------
//ROUTES
//------------------------

app.get('/', function(req, res) {
  MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      db.collection("Devices").find().toArray(function(err, deviceResult) {
          if (err) throw err;
          db.close();

          res.render('pages/index',
          {devices: deviceResult});
      });
  });
});

//GET /settings
//connects to mongodb and fetches trigger data.  Then renders a page
//with query results.
app.get('/settings', function(req, res) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        db.collection("Days").find().toArray(function(err, result) {
            if (err) throw err;
            for (var i = 0; i < result.length; i++) {
                result[i].day = helpers.numberToName(result[i].day);
            }
            db.collection("Devices").find().toArray(function(err, deviceResult) {
                if (err) throw err;
                db.close();

                res.render('pages/settings',
                {result: result,
                  devices: deviceResult
                });
            });
        });
    });
});

//POST /settings
//inserts a form entry into the database, then redirects to /settings
//to avoid a double POST request on accidental refresh.
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


//GET /devices
//connects to mongodb and fetches trigger data.  Then renders a page
//with query results.
app.get('/devices', function(req, res) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        db.collection("Devices").find().toArray(function(err, result) {
            if (err) throw err;
            db.close();
            res.render('pages/devices', {result: result});
        });
    });
});


//POST /devices
//inserts a form entry into the database, then redirects to /devices
//to avoid a double POST request on accidental refresh.
app.post('/devices', function(req, res) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        db.collection("Devices").insertOne(req.body, function(err, ress) {
            if (err) throw err;
            console.log("Inserted Device");
            db.close();
            res.redirect('/devices');
        });
    });
});

//GET /deviceDelete
//deletes an entry from the device database
app.get('/deviceDelete/:id', function(req, res) {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var myquery = { "_id": ObjectId(req.params.id) };
      db.collection("Devices").deleteOne(myquery, function(err, obj) {
        if (err) throw err;
        console.log("1 document deleted");
        db.close();
        res.redirect('/devices');
      });
    });
});

//GET /dayDelete
//deletes an entry from the day database
app.get('/dayDelete/:id', function(req, res) {
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var myquery = { "_id": ObjectId(req.params.id) };
      db.collection("Days").deleteOne(myquery, function(err, obj) {
        if (err) throw err;
        console.log("1 document deleted");
        db.close();
        res.redirect('/settings');
      });
    });
});

//logs socket connection
io.on('connection', function(socket) {
    socket.on('userClick', function(socket) {
        client.publish(socket.top, socket.stat);
        console.log("Message Published to: "  + socket.top + " of value: " + socket.stat);
    });
});

//starts server
http.listen(3000, function() {
    console.log('Server Running.');
});

//uses built in javascript data functions and stores it to a variable.
//polls the database and checks to see if any entry matches the current time.
//if anything matches the current time then it publishes a status message
//to the stored mqtt topic.
//**does this every second.
//*****THERE IS PROBABLY A MORE ELEGANT WAY TO DO THIS.
MongoClient.connect(url, function(err, db) {
  setInterval(function() {
      var current = new Date();
      var day = current.getDay();
      var minutes = (current.getMinutes()<10?'0':'') + current.getMinutes() // gets info with leading digit
      var hours = (current.getHours()<10?'0':'') + current.getHours() // gets info with leading digit
      var time = hours + ":" + minutes + ":" + current.getSeconds();
      var seconds = ":0";

      if (err) throw err;
      db.collection("Days").find().toArray(function(err, result) {
          if (err) throw err;
          for (var i = 0; i < result.length; i++) {
              if (day == result[i].day && time == (result[i].time + seconds)) {
                  client.publish(result[i].topic, result[i].status);
              }
          }
          //db.close();
      });
      console.log("Day: " + day + " Time: " + time);
  }, 1000);
});
