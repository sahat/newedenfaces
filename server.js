var express = require('express'),
    async = require('async'),
    crypto = require('crypto'),
    http = require('http'),
    fs = require('fs'),
    path = require('path'),
    config = require('./config.js'),
    request = require('request'),
    xml2js = require('xml2js'),
    newrelic = require('newrelic'),
    mongoose = require('mongoose'),
    Grid = require('gridfs-stream'),
    SendGrid = require('sendgrid').SendGrid,
    _ = require('underscore');



/**
 * Controllers
 */
var characters = require('./controllers/characters');

// Helpers
// 
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}


//  Set the OpenShift environment variables.
var ipaddress = process.env.OPENSHIFT_NODEJS_IP ||
              process.env.OPENSHIFT_INTERNAL_IP;
var port = process.env.OPENSHIFT_NODEJS_PORT ||
         process.env.OPENSHIFT_INTERNAL_PORT || 8080;

if (typeof ipaddress === "undefined") {
  console.warn('No OPENSHIFT_IP address; using 127.0.0.1');
  ipaddress = "127.0.0.1";
}


app = express();

var parser = new xml2js.Parser();
mongoose.connect(config.mongoose, function(err) {
  if (err) {
    var tryToConnect = setInterval(function(){
      mongoose.connect(config.mongoose, function(err) {
        if (err) {
          return console.log('Could not connect to the DB on a successive try');
        } else {
          clearTimeout(tryToConnect);
        }
      });
    }, 5000);
    return console.log('Could not connect to the DB');
  }
});
var gfs = Grid(mongoose.connection.db, mongoose.mongo);

// DB Schema and Model
var Character = mongoose.model('Character', {
  characterId: { type: String, unique: true, index: true },
  name: String,
  image32: String,
  image64: String,
  image128: String,
  image256: String,
  image512: String,
  race: String,
  gender: String,
  bloodline: String,
  wins: { type: Number, default: 0, index: true },
  losses: { type: Number, default: 0 },
  reportCount: { type: Number, default: 0 }
});


// all environments
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon(__dirname + '/public/favicon.ico')); 
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());  
app.use(express.session({ secret: 'lolsec'}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


/**
 * Routes
 */
app.post('/api/report', characters.report);
app.put('/api/grid/:characterId', characters.updateAvatar);
app.get('/api/grid/:filename', characters.getAvatar);

// update count every hour
setInterval(function() {
  Character.count({}, function(err, count) {
    totalCount = count;
  });
}, 3600000);

// delete lowest ranked character
setInterval(function() {
  Character
  .find()
  .sort('-losses')
  .limit(1)
  .exec(function(err, data) {
    if (err) {
      return res.send(500, err);
    }
    Character.remove({ characterId: data[0].characterId }, function(err) {
      if (err) {
        console.log('Error in removing the biggest loser from the system');
        return res.send(500, err);
      }
      console.log('Lowest ranking character successfully deleted');
    });
  });
}, 86400000);

app.get('/api/count', characters.getTotalCount);

// GLOBAL VARIABLES
var counter = 0;
var totalCount = 0;
var allCharacters = [];
var votedCharacters = [];
var nonces = [];
var viewedCharacters = [];


Character.count({}, function(err, count) {
  totalCount = count;
});


Character
.find()
.exec(function(err, characters) {
  allCharacters = _.clone(characters);
  console.log('Finished fetching characters from DB.');
  allCharacters = _.shuffle(allCharacters);
});

app.get('/api/characters', characters.getTwoCharacters);
app.post('/api/vote', characters.vote);
app.get('/api/characters/worst', characters.getWorstCharacters);
app.get('/api/characters/top', characters.getTop);
app.get('/api/characters/all', characters.getAll);
app.get('/api/characters/top/:race', characters.topByRace);
app.get('/api/characters/top/:race/:bloodline', characters.topByBloodline);
app.get('/api/leaderboard', characters.leaderboard);
app.post('/api/characters', characters.newCharacter);
app.del('/api/characters/:characterId', characters.deleteCharacter);
app.get('/api/characters/:id', characters.getCharacter);

// PushState redirects
app.get('/add', function(req, res) {
  res.redirect('/#add');
});

app.get('/top', function(req, res) {
  res.redirect('/#top');
});

app.get('/hall-of-shame', function(req, res) {
  res.redirect('/#hall-of-shame');
});

app.get('/top/:race', function(req, res) {
  res.redirect('/#top/' + req.params.race);
});

app.get('/top/:race/:bloodline', function(req, res) {
  res.redirect('/#top/' + req.params.race + '/' + req.params.bloodline);
});

app.get('/characters/:id', function(req, res) {
  res.redirect('/#characters/' + req.params.id);
});

app.listen(port, ipaddress, function() {
  console.log('Express server started listening on %s:%d', ipaddress, port);
});

