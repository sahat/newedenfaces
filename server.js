// NPM stuff
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


// Application globals
app = express();
parser = new xml2js.Parser();

mongoose.connect(config.mongoose);
gfs = Grid(mongoose.connection.db, mongoose.mongo);


// Mongoose schema
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
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

/**
 * POST /report
 * Reported players will be automatically deleted after 3 strikes
 */
app.post('/api/report', function(req, res, next) {
  var characterId = req.body.characterId;
  var ipAddress = req.connection.remoteAddress;
  Character.findOne({ characterId: characterId }, function(err, character) {
    if (err) return next(err);
    character.reportCount++;
    if (character.reportCount >= 3) {
      var url = 'http://' + IP_ADDRESS + ':' + PORT + '/api/characters/' +
                characterId + '?secretCode=' + config.secretCode;
      request.del(url);
      console.log(character.name, 'has been removed by', ipAddress);
      res.send(200, character.name + ' has been removed');
    } else {
      character.save(function(err) {
        if (err) return next(err);
        console.log(character.name, 'has been reported by', ipAddress);
        res.send(200, character.name + ' has been reported');
      });
    }
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
 * GET /characters
 * Retrieves 2 characters per user and increments global counter.
 */
app.get('/api/characters', function(req, res, next) {

  var myIpAddress = req.header('x-forwarded-for') || req.connection.remoteAddress;
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
 * PUT /vote
 * This where winner and loser scores are updated
 */
app.put('/api/vote', function(req, res, next) {
  var ipAddress = req.connection.remoteAddress;

  if (!req.body.winner || !req.body.loser) {
    return next(new Error('Winner/Loser IDs are invalid or empty'));
  }

  var winner = req.body.winner;
  var loser = req.body.loser;

  // if (_.contains(votedCharacters , winner) || _.contains(votedCharacters, loser)) {
  //   console.warn('Already voted, this vote will not be counted');
  //   return res.send(200);
  // }
  async.parallel([
    // update winer
    function(callback){
      var updateCharacter = {
        $inc: { wins: 1 },
        $push: { pastMatches: { date: new Date, winner: winner, loser: loser } }
      };
      Character.update({ characterId: winner }, updateCharacter, function(err) {
        if (err) return next(err);
        callback(null);
      });
    },
    // update loser
    function(callback) {
      var updateCharacter = {
        $inc: { losses: 1 },
        $push: { pastMatches: { date: new Date, winner: winner, loser: loser } }
      };
      Character.update({ characterId: loser }, updateCharacter, function(err) {
        if (err) return next(err);
        callback(null);
      });
    }
  ],
  function(err) {
    if (err) return next(err);
    votedCharacters.push(winner, loser);
    var index = viewedCharacters.map(function(e) { return e.ip; }).indexOf(ipAddress);
    viewedCharacters.splice(index, 1);
    res.send(200);
  });
});


/**
 * GET /shame
 * Top 25 worst characters for the hall of shame
 */
app.get('/api/characters/shame', function(req, res, next) {
  Character
  .find()
  .sort('-losses')
  .limit(25)
  .exec(function(err, characters) {
    if (err) return next(err);
    res.send({ characters: characters});
  });
});


app.get('/api/characters/top', function(req, res) {
  Character
  .find()
  .sort('-wins')
  .limit(100)
  .exec(function(err, characters) {
    if (err) {
      console.log(err);
      return res.send(500, 'Error getting characters');
    }
    res.send({ characters: characters});
  });
});

/**
 * All male characters
 */
app.get('/api/characters/male', function(req, res) {
  Character
  .find()
  .where('gender', 'male')
  .sort('-wins')
  .limit(100)
  .exec(function(err, characters) {
    if (err) {
      console.log(err);
      return res.send(500, 'Error getting characters');
    }
    res.send({ characters: characters});
  });
});

/**
 * All male characters
 */
app.get('/api/characters/female', function(req, res) {
  Character
  .find()
  .where('gender', 'female')
  .sort('-wins')
  .limit(100)
  .exec(function(err, characters) {
    if (err) {
      console.log(err);
      return res.send(500, 'Error getting characters');
    }
    res.send({ characters: characters});
  });
});


// displays character count and used for search bar autocomplete
app.get('/api/characters/all', function(req, res) {
  Character
  .find()
  .select('name characterId')
  .exec(function(err, characters) {
    if (err) {
      console.log(err);
      return res.send(500, 'Error getting characters');
    }
    res.send({ characters: characters });
  });
});


app.get('/api/characters/top/:race', function(req, res) {
  var race = req.params.race.charAt(0).toUpperCase() + req.params.race.slice(1);
  Character
  .find()
  .where('race').equals(race)
  .sort('-wins')
  .limit(100)
  .exec(function(err, characters) {
    if (err) {
      console.log(err);
      return res.send(500, 'Error getting characters');
    }
    res.send({ characters: characters});
  });
});

app.get('/api/characters/male/:race', function(req, res) {
  var race = req.params.race.charAt(0).toUpperCase() + req.params.race.slice(1);
  Character
  .find()
  .where('gender', 'male')
  .where('race').equals(race)
  .sort('-wins')
  .limit(100)
  .exec(function(err, characters) {
    if (err) {
      console.log(err);
      return res.send(500, 'Error getting characters');
    }
    res.send({ characters: characters});
  });
});


app.get('/api/characters/female/:race', function(req, res) {
  var race = req.params.race.charAt(0).toUpperCase() + req.params.race.slice(1);
  Character
  .find()
  .where('gender', 'female')
  .where('race').equals(race)
  .sort('-wins')
  .limit(100)
  .exec(function(err, characters) {
    if (err) {
      console.log(err);
      return res.send(500, 'Error getting characters');
    }
    res.send({ characters: characters});
  });
});



app.get('/api/characters/top/:race/:bloodline', function(req, res) {
  var race = req.params.race.charAt(0).toUpperCase() + req.params.race.slice(1);
  var bloodline = req.params.bloodline.charAt(0).toUpperCase() + req.params.bloodline.slice(1);

  if (req.params.bloodline === 'jin-mei') {
    bloodline = req.params.bloodline.charAt(0).toUpperCase() + req.params.bloodline.slice(1,4) +
        req.params.bloodline.charAt(4).toUpperCase() + req.params.bloodline.slice(5);
  } else if (req.params.bloodline === 'ni-kunni') {
    bloodline = req.params.bloodline.charAt(0).toUpperCase() + req.params.bloodline.slice(1,3) +
        req.params.bloodline.charAt(3).toUpperCase() + req.params.bloodline.slice(4);
  }

  Character
  .find()
  .where('race').equals(race)
  .where('bloodline').equals(bloodline)
  .sort('-wins')
  .limit(100)
  .exec(function(err, characters) {
    if (err) {
      console.log(err);
      return res.send(500, 'Error getting characters');
    }
    res.send({ characters: characters});
  });
});

app.get('/api/characters/male/:race/:bloodline', function(req, res) {
  var race = req.params.race.charAt(0).toUpperCase() + req.params.race.slice(1);
  var bloodline = req.params.bloodline.charAt(0).toUpperCase() + req.params.bloodline.slice(1);

  if (req.params.bloodline === 'jin-mei') {
    bloodline = req.params.bloodline.charAt(0).toUpperCase() + req.params.bloodline.slice(1,4) +
        req.params.bloodline.charAt(4).toUpperCase() + req.params.bloodline.slice(5);
  } else if (req.params.bloodline === 'ni-kunni') {
    bloodline = req.params.bloodline.charAt(0).toUpperCase() + req.params.bloodline.slice(1,3) +
        req.params.bloodline.charAt(3).toUpperCase() + req.params.bloodline.slice(4);
  }

  Character
  .find()
  .where('race').equals(race)
  .where('bloodline').equals(bloodline)
  .sort('-wins')
  .limit(100)
  .exec(function(err, characters) {
    if (err) {
      console.log(err);
      return res.send(500, 'Error getting characters');
    }
    res.send({ characters: characters});
  });
});

app.get('/api/characters/female/:race/:bloodline', function(req, res) {
  var race = req.params.race.charAt(0).toUpperCase() + req.params.race.slice(1);
  var bloodline = req.params.bloodline.charAt(0).toUpperCase() + req.params.bloodline.slice(1);

  if (req.params.bloodline === 'jin-mei') {
    bloodline = req.params.bloodline.charAt(0).toUpperCase() + req.params.bloodline.slice(1,4) +
        req.params.bloodline.charAt(4).toUpperCase() + req.params.bloodline.slice(5);
  } else if (req.params.bloodline === 'ni-kunni') {
    bloodline = req.params.bloodline.charAt(0).toUpperCase() + req.params.bloodline.slice(1,3) +
        req.params.bloodline.charAt(3).toUpperCase() + req.params.bloodline.slice(4);
  }

  Character
  .find()
  .where('gender', 'female')
  .where('race').equals(race)
  .where('bloodline').equals(bloodline)
  .sort('-wins')
  .limit(100)
  .exec(function(err, characters) {
    if (err) {
      console.log(err);
      return res.send(500, 'Error getting characters');
    }
    res.send({ characters: characters});
  });
});


/**
 * GET /leaderboard
 * Displays top 14 characters in the footer section
 */
app.get('/api/leaderboard', function(req, res, next) {
  Character
  .find()
  .sort('-wins')
  .limit(14)
  .lean()
  .exec(function(err, characters) {
    if (err) return next(err);

    // Sort by winning percentage
    characters.sort(function(a, b) {
      if (a.wins / (a.wins + a.losses) < b.wins / (b.wins + b.losses)) return 1;
      if (a.wins / (a.wins + a.losses) > b.wins / (b.wins + b.losses)) return -1;
      return 0;
    });

    res.send({ characters: characters });
  });
});


/**
 * POST /characters
 * Adds new character to the database
 * Long and complex due to XML parsing and parallel image saving
 */
app.post('/api/characters', function(req, res, next) {
  var charNameInput = req.body.name;
  var gender = req.body.gender;
  if (!charNameInput) return next(new Error('Character name cannot be blank'));
  charNameInput = charNameInput.replace(/\s/g, '%20'); // strip space characters
  var characterIdUrl = 'https://api.eveonline.com/eve/CharacterID.xml.aspx?names=' + charNameInput;

  console.log(charNameInput);

  async.waterfall([
    function(callback){
      // get character id from character name
      request.get({ url: characterIdUrl }, function(err, r, body) {
        if (err) {
          console.log(err);
          return res.send(500, 'Error in retrieving character id');
        }

        parser.parseString(body, function(err, response) {
          if (err) {
            console.log('Exception in ParseString of adding new character');
            return res.send(500, 'parseString exception');
          }

          if (!response.eveapi || !response.eveapi.result[0] || 
            !response.eveapi.result[0].rowset[0] || 
            !response.eveapi.result[0].rowset[0].row[0]) {
            
            console.log('EVEAPI is not defined');
            return res.send(500, 'Character name is not found');
          

          } else if (response.eveapi.error) {
            console.log('Character name is not found');
            return res.send(404, 'Character name is not found');
          }

          var characterId = response.eveapi.result[0].rowset[0].row[0].$.characterID;
          var image32 = 'https://image.eveonline.com/Character/' + characterId + '_32.jpg';
          var image64 = 'https://image.eveonline.com/Character/' + characterId + '_64.jpg';
          var image128 = 'https://image.eveonline.com/Character/' + characterId + '_128.jpg';
          var image256 = 'https://image.eveonline.com/Character/' + characterId + '_256.jpg';
          var image512 = 'https://image.eveonline.com/Character/' + characterId + '_512.jpg';
          var characterInfoUrl = 'https://api.eveonline.com/eve/CharacterInfo.xml.aspx?characterID=' + characterId;

          // check if character already exists
          Character.findOne({'characterId': characterId }, function(err, character) {
            if (character) {
              console.log('Character already exists');
              return res.send(409, { characterId: character.characterId });
            }
            callback(null, characterId, characterInfoUrl, image32, image64, image128, image256, image512);
          });
        });
      });
    },
    function(characterId, characterInfoUrl, image32, image64, image128, image256, image512, waterfallCallback) {
      // Save images into MonoLab
      async.parallel({
        one: function(callback){
          var filename32 = image32.replace(/^.*[\\\/]/, '');
          var filepath32 = path.join(__dirname, filename32);
          var writestream32 = gfs.createWriteStream({ filename: filename32 });
          var imageStream32 = request(image32).pipe(fs.createWriteStream(filepath32));

          imageStream32.on('error', function(err) {
            console.log('Streaming Error');
            return res.send(500, err);
          });

          imageStream32.on('close', function(err) {
            if (err) {
              console.log(err);
              return res.send(500, 'Open file error has occured');
            }
            var gridstream = fs.createReadStream(filepath32).pipe(writestream32);
            
            gridstream.on('error', function(err) {
              console.log('GridFS Streaming Error');
              return res.send(500, err);
            });

            gridstream.on('close', function(err) {
              fs.unlink(filepath32)
              callback(null, filename32);
            });
          });
        },
        two: function(callback) {
          var filename64 = image64.replace(/^.*[\\\/]/, '');
          var filepath64 = path.join(__dirname, filename64);
          var writestream64 = gfs.createWriteStream({ filename: filename64 });
          var imageStream64 = request(image64).pipe(fs.createWriteStream(filepath64));

          imageStream64.on('error', function(err) {
            console.log('Streaming Error');
            return res.send(500, err);
          });

          imageStream64.on('close', function(err) {
            if (err) {
              console.log(err);
              return res.send(500, 'File error has occured');
            }
            var gridstream = fs.createReadStream(filepath64).pipe(writestream64);

            gridstream.on('error', function(err) {
              console.log('GridFS Streaming Error');
              return res.send(500, err);
            });

            gridstream.on('close', function(err) {
              fs.unlink(filepath64);
              callback(null, filename64);
            });
          });
        },
        three: function(callback){
          var filename128 = image128.replace(/^.*[\\\/]/, '');
          var filepath128 = path.join(__dirname, filename128);
          var writestream128 = gfs.createWriteStream({ filename: filename128 });
          var imageStream128 = request(image128).pipe(fs.createWriteStream(filepath128));

          imageStream128.on('error', function(err) {
            console.log('Streaming Error');
            return res.send(500, err);
          });

          imageStream128.on('close', function(err) {
            if (err) {
              console.log(err);
              return res.send(500, 'File error has occured');
            }
            var gridstream = fs.createReadStream(filepath128).pipe(writestream128);
            
            gridstream.on('error', function(err) {
              console.log('GridFS Streaming Error');
              return res.send(500, err);
            });

            gridstream.on('close', function(err) {
              fs.unlink(filepath128);
              callback(null, filename128);
            });
          });
        },
        four: function(callback){
          var filename256 = image256.replace(/^.*[\\\/]/, '');
          var filepath256 = path.join(__dirname, filename256);
          var writestream256 = gfs.createWriteStream({ filename: filename256 });
          var imageStream256 = request(image256).pipe(fs.createWriteStream(filepath256));

          imageStream256.on('error', function(err) {
            console.log('Streaming Error');
            return res.send(500, err);
          });

          imageStream256.on('close', function(err) {
            if (err) {
              console.log(err);
              return res.send(500, 'File error has occured');
            }
            var gridstream = fs.createReadStream(filepath256).pipe(writestream256);

            gridstream.on('error', function(err) {
              console.log('GridFS Streaming Error');
              return res.send(500, err);
            });

            gridstream.on('close', function(err) {
              fs.unlink(filepath256);
              callback(null, filename256);
            });
          });
        },
        five: function(callback){
          var filename512 = image512.replace(/^.*[\\\/]/, '');
          var filepath512 = path.join(__dirname, filename512);
          var writestream512 = gfs.createWriteStream({ filename: filename512 });
          var imageStream512 = request(image512).pipe(fs.createWriteStream(filepath512));

          imageStream512.on('error', function(err) {
            console.log('Streaming Error');
            return res.send(500, err);
          });

          imageStream512.on('close', function(err) {
            if (err) {
              console.log(err);
              return res.send(500, 'File error has occured');
            }
            var gridstream = fs.createReadStream(filepath512).pipe(writestream512);

            gridstream.on('error', function(err) {
              console.log('GridFS Streaming Error');
              return res.send(500, err);
            });

            gridstream.on('close', function(err) {
              fs.unlink(filepath512);
              callback(null, filename512);
            });
          });
        }
      },
      function(err, results) {
          if (err) {
            console.log(err);
            return res.send(500, err);
          }
          var filename32 = results.one;
          var filename64 = results.two;
          var filename128 = results.three;
          var filename256 = results.four;
          var filename512 = results.five;
          waterfallCallback(null, characterId, characterInfoUrl, filename32, filename64, filename128, filename256, filename512);
      });
    },
    function(characterId, characterInfoUrl, filename32, filename64, filename128, filename256, filename512, callback){
      // get character info: race, bloodline, etc.
      request.get({ url: characterInfoUrl }, function(err, r, body) {
        if (err) {
          console.log(err);
          return res.send(500, 'Error in retrieving character information page');
        }

        parser.parseString(body, function(err, response) {
          if (err) {
            console.log(err);
            return res.send(500, 'Error parsing XML');
          }
          if (!response.eveapi) {
            console.log('EVEAPI is not defined');
            return res.send(500, 'Character name is not found');
          } else if (response.eveapi.error) {
            console.log('404 while getting character info');
            return res.send(404);
          }
      
          var characterName = response.eveapi.result[0].characterName[0];
          var race = response.eveapi.result[0].race[0];
          var bloodline = response.eveapi.result[0].bloodline[0];
          
          var character = new Character({
            characterId: characterId,
            name: characterName,
            race: race,
            bloodline: bloodline,
            gender: gender || '',
            image32: '/api/grid/' + filename32,
            image64: '/api/grid/' + filename64,
            image128: '/api/grid/' + filename128,
            image256: '/api/grid/' + filename256,
            image512: '/api/grid/' + filename512
          });

          character.save(function(err) {
            if (err) {
              console.log(err);
              return res.send(500, 'Error while saving new character to database');
            }
            res.send(character);
          });
          
        });
      });

      callback(null, 'done');
    }
  ]);
});


/**
 * DEL /characterId
 * Delete a character and all its images from database
 * All five images are deleted in concurrently with async.parallel
 * This function requres the secret code as a querystring to prevent abuse
 */
app.del('/api/characters/:characterId', function(req, res, next) {
  var characterId = req.params.characterId;

  if (req.query.secretCode !== config.secretCode) {
    return next(new Error('Must have a valid secret code'));
  }

  Character.remove({ characterId: characterId }, function(err) {
    if (err) return next(err);

    async.parallel([
      function(callback){
        gfs.remove({ filename: characterId + '_32.jpg' }, function (err) {
          if (err) console.error(err);
          callback(null);
        });
      },
      function(callback) {
        gfs.remove({ filename: characterId + '_64.jpg' }, function (err) {
          if (err) console.error(err);
          callback(null);
        });        
      },
      function(callback){
        gfs.remove({ filename: characterId + '_128.jpg' }, function (err) {
          if (err) console.error(err);
          callback(null);
        });   
      },
      function(callback){
        gfs.remove({ filename: characterId + '_256.jpg' }, function (err) {
          if (err) console.error(err);
          callback(null);
        });  
      },
      function(callback){
        gfs.remove({ filename: characterId + '_512.jpg' }, function (err) {
          if (err) console.error(err);
          callback(null);
        });
      }
    ],
    function(err) {
      if (err) return next(err);
      console.log('Character', characterId, 'has been removed from GridFS');
      res.send(200);
    });
  });
});


/**
 * GET /characters/:id
 * Returns JSON for a single specified character
 */
app.get('/api/characters/:id', function(req, res) {
  Character.findOne({ characterId: req.params.id }, function(err, character) {
    if (err) return next(err);
    var characterCopy = character.toObject();
    characterCopy.pastMatches = characterCopy.pastMatches.slice(-4);
    res.send(characterCopy);
  });
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

app.post('/api/wrong-gender', function(req, res) {
  var id = req.body.characterId;
  Character.findOne({ characterId: id }, function(err, user) {
    if (err) return next(err);
    user.wrongGender = true;
    user.save(function(err) {
      if (err) return next(err);
      res.send(200, 'Successfully notified about wrong character gender');
    });
  });
});

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



// Starts the express application
app.listen(PORT, IP_ADDRESS, function() {
  console.log('Express server started listening on %s:%d', IP_ADDRESS, PORT);
});


// Gracefully logs an error message and kills the process
// Supervisor will intercept it and restart the application
process.on('uncaughtException', function(err) {
  console.error(err);
  process.exit(1);
});