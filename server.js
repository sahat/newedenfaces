// TODO: add hotness meter

var express = require('express'),
  async = require('async'),
  http = require('http'),
  fs = require('fs'),
  path = require('path'),
  request = require('request'),
  xml2js = require('xml2js'),
  mongoose = require('mongoose'),
  _ = require('underscore');

require('nodetime').profile({
  accountKey: 'd8cfc901fdad39ee66c23d74a7b4b43e9541ba16',
  appName: 'newedenfaces'
});

var config = require('./config.js');

// OpenShift Configuration
var IP_ADDRESS = process.env.OPENSHIFT_INTERNAL_IP || '127.0.0.1';
var PORT = process.env.OPENSHIFT_INTERNAL_PORT || 8000;

app = express();
parser = new xml2js.Parser();

//mongoose.connect('localhost');
mongoose.connect(config.mongoose);

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
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

/**
 * GET /api/characters
 * Retrieves 2 characters per user and increments global counter.
 */
app.get('/api/characters', function(req, res) {
  var choices = { 0: 'female', 1: 'male' };
  var randomGender = choices[Math.round(Math.random())]
  Character
  .find({ random: { $near: [Math.random(), 0] } })
  .where('voted', false)
  .where('gender', randomGender)
  .limit(2)
  .exec(function(err, characters) {
    if (characters.length < 2) {
      var oppositeRandomGender = randomGender === 'female' ? 'male' : 'female';
      Character
      .find({ random: { $near: [Math.random(), 0] } })
      .where('voted', false)
      .where('gender', oppositeRandomGender)
      .limit(2)
      .exec(function(err, characters) {
        if (characters.length < 2) {
          Character.find(function(err, characters) {
            characters.forEach(function(elem, index, array) {
              elem.voted = false;
              elem.random = [Math.random(), 0]
              elem.save(function(err) {
                console.log('Updating...');
              });
              res.send({ error: 'Hold your horses, working...' });
            });
          });
        } else {
          res.send({ characters: characters });
        }
      });
    } else {
      res.send({ characters: characters });
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
// TODO: change to PUT /api/characters
app.put('/api/vote', function(req, res) {
  var winner = req.body.winner;
  var loser = req.body.loser;
  if (!winner || !loser) return res.send(404);
  async.parallel([
    function(callback) {
      Character.update({ characterId: winner }, { $inc: { wins: 1 }, $set: { voted: true } }, function(err) {
        if (err) throw err;
        callback(null);
      });
    },
    function(callback) {
      Character.update({ characterId: loser }, { $inc: { losses: 1 }, $set: { voted: true } }, function(err) {
        if (err) throw err;
        callback(null);
      });
    }
  ], function() {
    res.send(200);
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
    res.send({ characters: characters });
  });
});

/**
 * GET /api/characters/top
 * Return top (100) highest ranked characters.
 * Filter gender, race, bloodline by a querystring.
 */
app.get('/api/characters/top', function(req, res) {
  var queryConditions = {};
  for (var key in req.query) {
    if (req.query.hasOwnProperty(key)) {
      queryConditions[key] = new RegExp('^' + req.query[key] + '$', 'i');
    }
  }
  var query = Character.find(queryConditions).where('gender', null).sort('-wins').lean();
  query.exec(function(err, characters) {
    if (err) throw err;
    characters.sort(function(a, b) {
      if (a.wins / (a.wins + a.losses) < b.wins / (b.wins + b.losses)) return 1;
      if (a.wins / (a.wins + a.losses) > b.wins / (b.wins + b.losses)) return -1;
      return 0;
    });
    characters = characters.slice(0, 100);
    res.send({ characters: characters });
  });
});

//app.get('/api/characters/top/:race', function(req, res) {
//});

/**
 * GET /api/leaderboard
 * Returns Top 14 characters, sorted by the winning percentage.
 */
app.get('/api/leaderboard', function(req, res) {
  Character
  .find()
  .sort('-wins')
  .limit(14)
  .lean()
  .exec(function(err, characters) {
    if (err) throw err;
    characters.sort(function(a, b) {
      if (a.wins / (a.wins + a.losses) < b.wins / (b.wins + b.losses)) return 1;
      if (a.wins / (a.wins + a.losses) > b.wins / (b.wins + b.losses)) return -1;
      return 0;
    });
    res.send({ characters: characters });
  });
});

/**
 * GET /api/characters/all
 * Returns a list of all characters (name only)
 */
app.get('/api/characters/all', function(req, res) {
  Character.find(null, 'name', function (err, characters) {
    if (err) throw err;
    res.send({ characters: characters });
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
          } catch(e) {
            return res.send(404, 'Character ID Not Found');
          }
          Character.findOne({ characterId: characterId }, function(err, character) {
            if (character) {
              res.send(409, { characterId: character.characterId });
            } else {
              callback(null, characterId);
            }
          });
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
          } catch(e) {
            return res.send(404, 'Character Info Not Found');
          }
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
        });
      });
    }
  ]);
});

app.post('/gender', function(req, res) {
  var id = req.body.characterId;
  var gender = req.body.gender;

  Character.findOne({ characterId: id}, function(err, character) {
    if (character) {
      console.log(character);
      character.gender = gender;
      character.wrongGender = false;
      character.save(function(err) {
        if (err) throw err;
        res.send('updated okay!');
      })
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

app.listen(PORT, IP_ADDRESS, function() {
  console.log('Express started listening on %s:%d', IP_ADDRESS, PORT);
});
