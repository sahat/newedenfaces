// TODO: add hotness meter
// TODO: Add like button
// TODO: Display count of each gender on gender page
// TODO: Stats page, with useful DB stats

// TODO: Instead of a blue top loading indicator, load the page instantly,
// then display the loading indicator (vertical bars) until content is loaded


var domain = require('domain');
var express = require('express');
var async = require('async');
var http = require('http');
var fs = require('fs');
var path = require('path');
var request = require('request');
var xml2js = require('xml2js');
var mongoose = require('mongoose');

var config = require('./config.js');

// OpenShift Configuration
var IP_ADDRESS = process.env.OPENSHIFT_NODEJS_IP ||
  process.env.OPENSHIFT_INTERNAL_IP || '127.0.0.1';
var PORT = process.env.OPENSHIFT_NODEJS_PORT ||
  process.env.OPENSHIFT_INTERNAL_PORT || 8080;

var app = express();


// MongoDB in its own domain
var dbDomain = domain.create();

dbDomain.run(function() {
  mongoose.connect(config.mongoose);
});

// Graceful error handling for MongoDB
dbDomain.on('error', function(err) {
  console.error(err.message);
  setTimeout(function() {
    mongoose.connect(config.mongoose);
  }, 2000);
});

// Mongoose schema
var Character = mongoose.model('Character', {
  characterId: { type: String, unique: true, index: true },
  name: String,
  race: String,
  gender: String,
  wrongGender: Boolean,
  bloodline: String,
  wins: { type: Number, default: 0, index: true },
  losses: { type: Number, default: 0 },
  reports: { type: Number, default: 0 },
  random: { type: [Number], index: '2d' },
  voted: { type: Boolean, default: false }
});

// Express configuration
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

/**
* GET /api/characters
* Retrieves 2 characters per user and increments global counter.
*/
app.get('/api/characters', function(req, res) {
  var choices = { 0: 'female', 1: 'male' };
  var randomGender = choices[Math.round(Math.random())];
  Character
  .find({ random: { $near: [Math.random(), 0] } })
  .where('voted', false)
  .where('gender', randomGender)
  .limit(2)
  .exec(function(err, characters) {
    if (err) throw err;
    if (characters.length < 2) {
      var oppositeRandomGender = randomGender === 'female' ? 'male' : 'female';
      Character
      .find({ random: { $near: [Math.random(), 0] } })
      .where('voted', false)
      .where('gender', oppositeRandomGender)
      .limit(2)
      .exec(function(err, characters) {
        if (err) { throw err; }
        if (characters.length < 2) {
          // TODO: Update math.random as well
          Character.update({}, { $set: { voted: false } }, { multi: true }, function(err) {
            if (err) { throw err; }
            console.log('Less than 2: Reset voted flags');
          });
          res.send([]);
        } else {
          res.send(characters);
        }
      });
    } else {
      res.send(characters);
    }
  });
});

/**
* POST /report
* Increment character's report count. After (3) successive strikes,
* that character gets deleted from the database.
*/
app.post('/api/report', function(req, res) {
  var characterId = req.body.characterId;
  Character.findOne({ characterId: characterId }, function(err, character) {
    if (err) throw err;
    if (character) {
      character.reports++;
      if (character.reports >= 3) {
        var url = req.protocol + '://' + req.host + ':' + PORT +
          '/api/characters/' + characterId + '?secretCode=' + config.secretCode;
        request.del(url);
        res.send(200);
      } else {
        character.save(function(err) {
          if (err) throw err;
          res.send(200, character.name + ' has been reported');
        });
      }
    } else {
      res.send(404);
    }
  });
});

/**
* POST /report/gender
* Marks a character as being an invalid gender,
* e.g. Actual "male" avatar has been added as "female"
*/
app.post('/api/report/gender', function(req, res) {
  var characterId = req.body.characterId;
  Character.findOne({ characterId: characterId }, function(err, user) {
    if (err) throw err;
    if (user) {
      user.wrongGender = true;
      user.save(function(err) {
        if (err) throw err;
        res.send(200);
      });
    } else {
      res.send(404);
    }
  });
});

/**
* DEL /api/characters/:id
* Delete a character from the database
* Requres the secret code as a querystring to prevent abuse
*/
app.del('/api/characters/:id', function(req, res) {
  var characterId = req.params.id;
  if (req.query.secretCode !== config.secretCode) {
    return res.send(500);
  }
  Character.remove({ characterId: characterId }, function(err) {
    if (err) throw err;
    res.send(200);
  });
});

/**
* PUT /api/vote
* Update winning and losing count for characters.
*/
app.put('/api/characters', function(req, res) {
  var winner = req.body.winner;
  var loser = req.body.loser;
  if (!winner || !loser) return res.send(404);
  Character.findOne({ characterId: winner }, function(err, winner) {
    Character.findOne({ characterId: loser }, function(err, loser) {
      if (winner.voted || loser.voted) return res.send(200);
      async.parallel([
        function(callback) {
          winner.wins++;
          winner.voted = true;
          winner.random = [Math.random(), 0];
          winner.save(function(err) {
            callback(null);
          });
        },
        function(callback) {
          loser.losses++;
          loser.voted = true;
          loser.random = [Math.random(), 0];
          loser.save(function(err) {
            callback(null);
          });
        }
      ], function(err) {
        res.send(200);
      });
    });
  });
});

/**
* GET /api/characters/shame
* Return top (25) lowest ranked characters for the hall of shame
*/
app.get('/api/characters/shame', function(req, res) {
  Character
  .find()
  .sort('-losses')
  .limit(25)
  .exec(function(err, characters) {
    if (err) throw err;
    res.send(characters);
  });
});

/**
* GET /api/characters/top
* Return top (100) highest ranked characters.
* Filter gender, race, bloodline by a querystring.
*/
app.get('/api/characters/top', function(req, res) {
  var conditions = {};
  for (var key in req.query) {
    if (req.query.hasOwnProperty(key)) {
      conditions[key] = new RegExp('^' + req.query[key] + '$', 'i');
    }
  }
  Character.find(conditions).sort('-wins').limit(100).exec(function(err, characters) {
    if (err) throw err;
    characters.sort(function(a, b) {
      if (a.wins / (a.wins + a.losses) < b.wins / (b.wins + b.losses)) return 1;
      if (a.wins / (a.wins + a.losses) > b.wins / (b.wins + b.losses)) return -1;
      return 0;
    });
    res.send(characters.slice(0, 100));
  });
});

/**
* GET /api/leaderboard
* Returns Top 10 characters, sorted by the winning percentage.
*/
app.get('/api/leaderboard', function(req, res) {
  Character
  .find()
  .sort('-wins')
  .limit(12)
  .lean()
  .exec(function(err, characters) {
    if (err) throw err;
    characters.sort(function(a, b) {
      if (a.wins / (a.wins + a.losses) < b.wins / (b.wins + b.losses)) return 1;
      if (a.wins / (a.wins + a.losses) > b.wins / (b.wins + b.losses)) return -1;
      return 0;
    });
    res.send(characters);
  });
});

/**
* GET /api/characters/all
* Returns a list of all characters (name only)
*/
app.get('/api/characters/all', function(req, res) {
  Character.find(null, 'characterId name', function (err, characters) {
    if (err) throw err;
    res.send(characters);
  });
});

app.get('/api/characters/wrong-gender', function(req, res) {
  Character.where('wrongGender', true).exec(function (err, characters) {
    if (err) throw err;
    res.send(characters);
  });
});

/**
* GET /api/characters/:id
* Returns one specified character.
*/
app.get('/api/characters/:id', function(req, res) {
  Character.findOne({ characterId: req.params.id }, function(err, character) {
    if (err) throw err;
    if (character) {
      res.send(character);
    } else {
      res.send(404);
    }
  });
});

/**
* POST /api/characters
* Adds a character to the database.
*/
app.post('/api/characters', function(req, res) {
  var parser = new xml2js.Parser();

  var gender = req.body.gender;
  var charName = decodeURIComponent(req.body.name || '');
  var characterIdUrl = 'https://api.eveonline.com/eve/CharacterID.xml.aspx?names=' + charName;
  async.waterfall([
    function(callback) {
      request.get(characterIdUrl, function(e, r, xml) {
        if (e) throw e;
        parser.parseString(xml, function(err, parsedXml) {
          if (err) throw err;
          try {
            var characterId = parsedXml.eveapi.result[0].rowset[0].row[0].$.characterID;

            Character.findOne({ characterId: characterId }, function(err, character) {
              if (character) {
                res.send(409, { characterId: character.characterId });
              } else {
                callback(null, characterId);
              }
            });

          } catch(e) {
            return res.send(404, 'Character ID Not Found');
          }

        });
      });
    },
    function(characterId, callback) {
      var characterInfoUrl = 'https://api.eveonline.com/eve/CharacterInfo.xml.aspx?characterID=' + characterId;
      request.get({ url: characterInfoUrl }, function(e, r, xml) {
        if (e) throw e;
        parser.parseString(xml, function(err, parsedXml) {
          if (err) throw err;
          try {
            var name = parsedXml.eveapi.result[0].characterName[0];
            var race = parsedXml.eveapi.result[0].race[0];
            var bloodline = parsedXml.eveapi.result[0].bloodline[0];

            var character = new Character({
              characterId: characterId,
              name: name,
              race: race,
              bloodline: bloodline,
              gender: gender,
              random: [Math.random(), 0]
            });

            character.save(function(err) {
              if (err) throw err;
              res.send(character);
            });

            callback(null);

          } catch(e) {
            return res.send(404, 'Character Info Not Found');
          }

        });
      });
    }
  ]);
});

/**
* POST /api/gender
* Update character's gender.
*/
app.post('/api/gender', function(req, res) {
  var id = req.body.characterId;
  var gender = req.body.gender;
  Character.findOne({ characterId: id}, function(err, character) {
    if (character) {
      character.gender = gender;
      character.wrongGender = false;
      character.save(function(err) {
        if (err) throw err;
        res.send(200);
      });
    }
  });
});

/**
* Backbone pushstate redirects
*/
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

app.get('/male', function(req, res) {
  res.redirect('/#male');
});

app.get('/female', function(req, res) {
  res.redirect('/#female');
});

app.get('/male/:race', function(req, res) {
  res.redirect('/#male/' + req.params.race);
});

app.get('/female/:race', function(req, res) {
  res.redirect('/#female/' + req.params.race);
});

app.get('/male/:race/:bloodline', function(req, res) {
  res.redirect('/#male/' + req.params.race + '/' + req.params.bloodline);
});

app.get('/female/:race/:bloodline', function(req, res) {
  res.redirect('/#female/' + req.params.race + '/' + req.params.bloodline);
});

app.get('/wrong-gender', function(req, res) {
  res.redirect('/#wrong-gender');
});

app.listen(PORT, IP_ADDRESS, function() {
  console.log('Express started listening on %s:%d', IP_ADDRESS, PORT);
});