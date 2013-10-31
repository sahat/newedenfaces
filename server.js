var express = require('express'),
  async = require('async'),
  crypto = require('crypto'),
  http = require('http'),
  fs = require('fs'),
  path = require('path'),
  request = require('request'),
  xml2js = require('xml2js'),
  mongoose = require('mongoose'),
  Grid = require('gridfs-stream'),
  _ = require('underscore');

require('nodetime').profile({
  accountKey: 'd8cfc901fdad39ee66c23d74a7b4b43e9541ba16',
  appName: 'newedenfaces'
});

function isNumber() {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

var config = require('./config.js');

// OpenShift Configuration
var IP_ADDRESS = process.env.OPENSHIFT_NODEJS_IP ||
  process.env.OPENSHIFT_INTERNAL_IP || '127.0.0.1';
var PORT = process.env.OPENSHIFT_NODEJS_PORT ||
  process.env.OPENSHIFT_INTERNAL_PORT || 8080;

app = express();
parser = new xml2js.Parser();

mongoose.connect('localhost');
//mongoose.connect(config.mongoose);
gfs = Grid(mongoose.connection.db, mongoose.mongo);

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
  reportCount: { type: Number, default: 0 },
  pastMatches: Array
});

var Match = mongoose.model('Match', {
  date: Date,
  characters: Array
});

// Express configuration
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// Development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

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
      character.reportCount++;
      if (character.reportCount >= 3) {
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
 *
 */
app.put('/api/grid/:characterId', function(req, res) {
  if (isNumber(req.params.characterId)) {
    var characterId = req.params.characterId;
  } else {
    return res.send(500, 'Character ID must be a number')
  }
  
  async.parallel({
    one: function(callback){
      var image32 = 'https://image.eveonline.com/Character/' + characterId + '_32.jpg';
      var filename32 = image32.replace(/^.*[\\\/]/, '');
      var filepath32 = path.join(__dirname, filename32);
      var writestream32 = gfs.createWriteStream({ filename: filename32 });
      var imageStream32 = request(image32).pipe(fs.createWriteStream(filepath32));

      imageStream32.on('error', function(err) {
        console.log('Streaming Error');
        return res.send(500, err);
      });

      writestream32.on('error', function(err) {
        console.log('Streaming Error');
        return res.send(500, err);
      });

      imageStream32.on('close', function(err) {
        if (err) {
          console.error(err);
          return res.send(500, 'File error has occured');
        }
        gfs.remove({ filename: filename32 }, function (err) {
          if (err) {
            console.log('Error removing file from GridFS');
            return res.send(500, 'Failed to remove image from gridfs');
          }
          console.log('success!');
          var gridstream = fs.createReadStream(filepath32).pipe(writestream32);
          gridstream.on('error', function(err) {
            console.log('GridFS stream error during character add on 32px');
            return res.send(500, err);
          });
          gridstream.on('close', function(err) {
            fs.unlink(filepath32);
            callback(null, filename32);
          });
        });
      });
    },
    two: function(callback) {
      var image64 = 'https://image.eveonline.com/Character/' + characterId + '_64.jpg';
      var filename64 = image64.replace(/^.*[\\\/]/, '');
      var filepath64 = path.join(__dirname, filename64);
      var writestream64 = gfs.createWriteStream({ filename: filename64 });
      var imageStream64 = request(image64).pipe(fs.createWriteStream(filepath64));

      imageStream64.on('error', function(err) {
        console.log('Streaming Error');
        return res.send(500, err);
      });

      writestream64.on('error', function(err) {
        console.log('Streaming Error');
        return res.send(500, err);
      });

      imageStream64.on('close', function(err) {
        if (err) {
          console.log(err);
          return res.send(500, 'File error has occured');
        }
        gfs.remove({ filename: filename64 }, function (err) {
          if (err) {
            console.log('Error removing file from GridFS');
            return res.send(500, 'Failed to remove image from gridfs');
          }
          console.log('success!');
          var gridstream = fs.createReadStream(filepath64).pipe(writestream64);
          gridstream.on('error', function(err) {
            console.log('GridFS stream error during character add on 64px');
            return res.send(500, err);
          });
          gridstream.on('close', function(err) {
            fs.unlink(filepath64);
            callback(null, filename64);
          });
        });
      });
    },
    three: function(callback){
      var image128 = 'https://image.eveonline.com/Character/' + characterId + '_128.jpg'; 
      var filename128 = image128.replace(/^.*[\\\/]/, '');
      var filepath128 = path.join(__dirname, filename128);
      var writestream128 = gfs.createWriteStream({ filename: filename128 });
      var imageStream128 = request(image128).pipe(fs.createWriteStream(filepath128));

      imageStream128.on('error', function(err) {
        console.log('Streaming Error');
        return res.send(500, err);
      });

      writestream128.on('error', function(err) {
        console.log('Streaming Error');
        return res.send(500, err);
      });

      imageStream128.on('close', function(err) {
        if (err) {
          console.log(err);
          return res.send(500, 'File error has occured');
        }
        gfs.remove({ filename: filename128 }, function (err) {
          if (err) {
            console.log('Error removing file from GridFS');
            return res.send(500, 'Failed to remove image from gridfs');
          }
          console.log('success!');
          var gridstream = fs.createReadStream(filepath128).pipe(writestream128);
          gridstream.on('error', function(err) {
            console.log('GridFS stream error during character add on 128px');
            return res.send(500, err);
          });
          gridstream.on('close', function(err) {
            fs.unlink(filepath128);
            callback(null, filename128);
          });
        });

        
      });
    },
    four: function(callback){
      var image256 = 'https://image.eveonline.com/Character/' + characterId + '_256.jpg'; 
      var filename256 = image256.replace(/^.*[\\\/]/, '');
      var filepath256 = path.join(__dirname, filename256);
      var writestream256 = gfs.createWriteStream({ filename: filename256 });
      var imageStream256 = request(image256).pipe(fs.createWriteStream(filepath256));

      imageStream256.on('error', function(err) {
        console.log('Streaming Error');
        return res.send(500, err);
      });

      writestream256.on('error', function(err) {
        console.log('Streaming Error');
        return res.send(500, err);
      });

      imageStream256.on('close', function(err) {
        if (err) {
          console.log(err);
          return res.send(500, 'File error has occured');
        }
        gfs.remove({ filename: filename256 }, function (err) {
          if (err) {
            console.log('Error removing file from GridFS');
            return res.send(500, 'Failed to remove image from gridfs');
          }
          console.log('success!');
          var gridstream = fs.createReadStream(filepath256).pipe(writestream256);
          gridstream.on('error', function(err) {
            console.log('GridFS stream error during character add on 256px');
            return res.send(500, err);
          });
          gridstream.on('close', function(err) {
            fs.unlink(filepath256);
            callback(null, filename256);
          });
        });
      });
    },
    five: function(callback){
      var image512 = 'https://image.eveonline.com/Character/' + characterId + '_512.jpg';
      var filename512 = image512.replace(/^.*[\\\/]/, '');
      var filepath512 = path.join(__dirname, filename512);
      var writestream512 = gfs.createWriteStream({ filename: filename512 });
      var imageStream512 = request(image512).pipe(fs.createWriteStream(filepath512));
      
      imageStream512.on('error', function(err) {
        console.log('Streaming Error');
        return res.send(500, err);
      });

      writestream512.on('error', function(err) {
        console.log('Streaming Error');
        return res.send(500, err);
      });

      imageStream512.on('close', function(err) {
        if (err) {
          console.log(err);
          return res.send(500, 'File error has occured');
        }
        gfs.remove({ filename: filename512 }, function (err) {
          if (err) {
            console.log('Error removing file from GridFS');
            return res.send(500, 'Failed to remove image from gridfs');
          }
          console.log('success!');
          var gridstream = fs.createReadStream(filepath512).pipe(writestream512);
          gridstream.on('error', function(err) {
            console.log('GridFS stream error during character add on 512px');
            return res.send(500, err);
          });
          gridstream.on('close', function(err) {
            fs.unlink(filepath512);
            callback(null, filename512);
          });
        });

      });
    }
  },
  function(err, results) {
    if (err) {
      console.log(err);
      return res.send(500, err);
    }
    console.log(results);

    var filename32 = results.one;
    var filename64 = results.two;
    var filename128 = results.three;
    var filename256 = results.four;
    var filename512 = results.five;

    Character.findOne({ characterId: req.params.characterId }, function(err, character) {
      if (err) {
        return res.send(500, err);
      }
      if (!character) {
        return res.send(500, 'No such character');
      }
      character.image32 = '/api/grid/' + filename32;
      character.image64 = '/api/grid/' + filename64;
      character.image128 ='/api/grid/' + filename128;
      character.image256 = '/api/grid/' + filename256;
      character.image512 = '/api/grid/' + filename512;

      character.save(function(err) {
        if (err) {
          console.log(err);
          return res.send(500, 'Error while saving new character to database');
        }
        res.send(character);
      });
    });

  });
});
app.get('/api/grid/:filename', function(req, res) {
  var filename = req.params.filename;
  var gfs = Grid(mongoose.connection.db, mongoose.mongo);
  var readstream = gfs.createReadStream({
    filename: filename
  });
  readstream.pipe(res);
  readstream.on('error', function(err) {
    return res.send(500, 'Error while retriving a file from database');
  });
});

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


/**
 * GET /api/characters
 * Retrieves 2 characters per user and increments global counter.
 */
app.get('/api/characters', function(req, res) {
  var myIpAddress = req.connection.remoteAddress;
  var randomString = crypto.randomBytes(20).toString('hex');

  // When all characters have been voted on...
  if (counter > allCharacters.length) {

     console.log('----reached the end------');

    // Retrieve new set of characters in case new characters have been
    // added since the last query, and then shuffle them.
    Character.find(function(err, characters) {
      if (err) {
        console.log(err);
        return res.send(500, err);
      }


      counter = 0;
      votedCharacters = []; // stores character ids
      viewedCharacters = []; // stores user ip addresses + counter
      nonces = [];

      allCharacters = _.clone(characters);
      allCharacters = _.shuffle(allCharacters);

      res.send(allCharacters.slice(counter, counter + 2));
      counter = counter + 2;
    });

  } else {
    //console.log('Global: ' + counter + ' out of ' + allCharacters.length);
    nonces.push(randomString);

    if (_.contains(_.pluck(viewedCharacters, 'ip'), myIpAddress)) {
      var index = viewedCharacters.map(function(e) { return e.ip; }).indexOf(myIpAddress);
      var myCounter = viewedCharacters[index].counter;
      return res.send({ nonce: randomString, characters: allCharacters.slice(myCounter, myCounter + 2) });
    }

    viewedCharacters.push({
      ip: myIpAddress,
      counter: counter
    });

    // add a random hash string


    res.send({ nonce: randomString, characters: allCharacters.slice(counter, counter + 2) });

    counter = counter + 2;
  }
});


/**
 * PUT /api/vote
 * Update winning and losing count for characters
 */
app.put('/api/vote', function(req, res) {
  var clientIpAddress = req.connection.remoteAddress;
  var winner = req.body.winner;
  var loser = req.body.loser;
  if (!winner || !loser) return res.send(404);
  async.parallel([
    function(callback) {
      var update = {
        $inc: { wins: 1 },
        $push: { pastMatches: { date: new Date, winner: winner, loser: loser } }
      };
      Character.update({ characterId: winner }, update, function(err) {
        if (err) throw err;
        callback(null);
      });
    },
    function(callback) {
      var update = {
        $inc: { losses: 1 },
        $push: { pastMatches: { date: new Date, winner: winner, loser: loser } }
      };
      Character.update({ characterId: loser }, update, function(err) {
        if (err) throw err;
        callback(null);
      });
    }
  ], function() {
    var index = viewedCharacters.map(function(e) { return e.ip; }).indexOf(clientIpAddress);
    viewedCharacters.splice(index, 1);
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
      conditions[key] = new RegExp('^' + req.query[key] + '$', 'i');
    }
  }
  var query = Character.find(queryConditions).sort('-wins').lean();
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
 * Returns Top 14 characters, sorted by the winning percentage
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
      var characterCopy = character.toObject();
      characterCopy.pastMatches = characterCopy.pastMatches.slice(-4);
      res.send(characterCopy);
    } else {
      res.send(404);
    }
  });
});



/**
 * POST /api/characters
 * Adds new character to the database.
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
            var characterName = parsedXml.eveapi.result[0].characterName[0];
            var race = parsedXml.eveapi.result[0].race[0];
            var bloodline = parsedXml.eveapi.result[0].bloodline[0];
          } catch(e) {
            return res.send(404, 'Character Info Not Found');
          }
          var character = new Character({
            characterId: characterId,
            name: characterName,
            race: race,
            bloodline: bloodline,
            gender: gender
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




// app.post('/gender', function(req, res) {
//   var id = req.body.characterId;
//   var gender = req.body.gender;

//   Character.findOne({ characterId: id}, function(err, character) {
//     if (character) {
//       console.log(character);
//       character.gender = gender;
//       character.wrongGender = false;
//       character.save(function(err) {
//         if (err) throw err;
//         res.send('updated okay!');
//       })
//     }
//   });
// });


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
