#!/bin/env node

// TODO: Node.js error handler module

var
  express = require('express'),
  async = require('async'),
  http = require('http'),
  fs = require('fs'),
  path = require('path'),
  config = require('./config.js'),
  request = require('request'),
  xml2js = require('xml2js'),
  mongoose = require('mongoose'),
  Grid = require('gridfs-stream'),
  SendGrid = require('sendgrid').SendGrid,
  _ = require('underscore');



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
    console.log('Could not connect to the DB');
    res.send(500, 'Error Connecting to the database');
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


// report endpoint
// I could add an if-statement to api/characters/:id instead that will get
// checked everytime is model saved on backbone, but that will cause performance issues
// That endpoint is also used on the home page where most people spend their time,
// so checking an if-statement thousands of times is redundant
app.post('/api/report', function(req, res) {
  Character.findOne({ characterId: req.body.characterId }, function(err, character) {
    if (err) {
      console.log(err);
      return res.send(500, err);
    }

    character.reportCount += 1;
    
    if (character.reportCount >= 10) {
      // remove character from DateB
      Character.remove({ characterId: req.body.characterId }, function (err) {
        if (err) {
          console.log(err);
          return res.send(500, err);
        }
        console.log('Character has been removed');
        res.send(200, {'message': 'Character has been removed'});
      });
    } else {
      character.save(function(err) {
        if (err) {
          console.log(err);
          return res.send(500, err);
        }
        res.send(200, {'message': 'Character has been reported++'});
      });
    }
  });
});

app.put('/api/grid/:characterId', function(req, res) {
  async.parallel({
    one: function(callback){
      var image32 = 'https://image.eveonline.com/Character/' + req.params.characterId + '_32.jpg';
      var filename32 = image32.replace(/^.*[\\\/]/, '');
      var filepath32 = path.join(__dirname, filename32);
      var writestream32 = gfs.createWriteStream({ filename: filename32 });
      var imageStream32 = request(image32).pipe(fs.createWriteStream(filepath32));

      imageStream32.on('close', function(err) {
        if (err) {
          console.log(err);
          return res.send(500, 'File error has occured');
        }
        gfs.remove({ filename: filename32 }, function (err) {
          if (err) {
            console.log('Error removing file from GridFS');
            return res.send(500, 'Failed to remove image from gridfs');
          }
          console.log('success!');
          var gridstream = fs.createReadStream(filepath32).pipe(writestream32);
          gridstream.on('close', function(err) {
            fs.unlink(filepath32);
            callback(null, filename32);
          });
        });
      });
    },
    two: function(callback) {
      var image64 = 'https://image.eveonline.com/Character/' + req.params.characterId + '_64.jpg';
      var filename64 = image64.replace(/^.*[\\\/]/, '');
      var filepath64 = path.join(__dirname, filename64);
      var writestream64 = gfs.createWriteStream({ filename: filename64 });
      var imageStream64 = request(image64).pipe(fs.createWriteStream(filepath64));

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
          gridstream.on('close', function(err) {
            fs.unlink(filepath64);
            callback(null, filename64);
          });
        });
      });
    },
    three: function(callback){
      var image128 = 'https://image.eveonline.com/Character/' + req.params.characterId + '_128.jpg'; 
      var filename128 = image128.replace(/^.*[\\\/]/, '');
      var filepath128 = path.join(__dirname, filename128);
      var writestream128 = gfs.createWriteStream({ filename: filename128 });
      var imageStream128 = request(image128).pipe(fs.createWriteStream(filepath128));

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
          gridstream.on('close', function(err) {
            fs.unlink(filepath128);
            callback(null, filename128);
          });
        });

        
      });
    },
    four: function(callback){
      var image256 = 'https://image.eveonline.com/Character/' + req.params.characterId + '_256.jpg'; 
      var filename256 = image256.replace(/^.*[\\\/]/, '');
      var filepath256 = path.join(__dirname, filename256);
      var writestream256 = gfs.createWriteStream({ filename: filename256 });
      var imageStream256 = request(image256).pipe(fs.createWriteStream(filepath256));

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
          gridstream.on('close', function(err) {
            fs.unlink(filepath256);
            callback(null, filename256);
          });
        });
      });
    },
    five: function(callback){
      var image512 = 'https://image.eveonline.com/Character/' + req.params.characterId + '_512.jpg';
      var filename512 = image512.replace(/^.*[\\\/]/, '');
      var filepath512 = path.join(__dirname, filename512);
      var writestream512 = gfs.createWriteStream({ filename: filename512 });
      var imageStream512 = request(image512).pipe(fs.createWriteStream(filepath512));

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
    console.log(results.five);

    var filename32 = results.one;
    var filename64 = results.two;
    var filename128 = results.three;
    var filename256 = results.four;
    var filename512 = results.five;

    Character.findOne({ characterId: req.params.characterId }, function(err, character) {
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

app.post('/api/grid', function(req, res) {
  var url = 'https://image.eveonline.com/Character/' + req.body.characterId + '_' + req.body.size + '.jpg';
  var filename = url.replace(/^.*[\\\/]/, '');
  var filepath = path.join(__dirname, filename);

  var gfs = Grid(mongoose.connection.db, mongoose.mongo);
  var writestream = gfs.createWriteStream({ filename: filename });

  var imageStream = request(url).pipe(fs.createWriteStream(filepath));

  imageStream.on('close', function() {
    fs.createReadStream(filepath).pipe(writestream);
    res.send(200);
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




//  Add handlers for the app (from the routes).
app.put('/api/characters/:id', function(req, res) {
  Character.findOne({ characterId: req.body.characterId }, function(err, character) {
    if (err) {
      console.log(err);
      return res.send(500, 'Error in accessing the database');
    }
  
    character.userRating = req.body.userRating;
    character.userRatingVotes = req.body.userRatingVotes;
    character.save(function(err) {
      if (err) {
        console.log(err);
        return res.send(500, err);
      }
      res.send(200);
    });
  });
});

  
// TODO: USE CRON JOB INSTEAD


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

app.get('/api/count', function(req, res) {
  Character.count({}, function(err, count) {
    if (err) {
      console.log('Error processing count');
      return res.send(500, err);
    }

    res.send({ count: count });
  });
});

// GLOBAL VARIABLES
var counter = 0;
var totalCount = 0;
var allCharacters = [];
var votedCharacters = [];

var seenCharacters = [];

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
 * Retrieve 2 characters for the home page screen 
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
app.get('/api/characters', function(req, res) {
  var myIpAddress = req.header('x-forwarded-for') || req.connection.remoteAddress;

  // When all characters have been voted on...
  if (counter > totalCount) {
    console.log('----reached the end------');
    counter = 0;
    votedCharacters = []; // stores character ids
    seenCharacters = []; // stores user ip addresses + counter


    // Retrieve new set of characters in case new characters have been
    // added since the last query, and then shuffle them.
    Character.find(function(err, characters) {
      if (err) {
        console.log(err);
        return res.send(500, err);
      }
      allCharacters = _.clone(characters);
      allCharacters = _.shuffle(allCharacters);

      res.send(allCharacters.slice(counter, counter + 2));
      counter = counter + 2;
    });
    
  } else {
    
    console.log('Global: ' + counter + ' out of ' + totalCount);
    
    if (_.contains(_.pluck(seenCharacters, 'ip'), myIpAddress)) {
      var index = seenCharacters.map(function(e) { return e.ip; }).indexOf(myIpAddress);
      var myCounter = seenCharacters[index].counter;
      console.log('Personal: ' + myCounter + ' out of ' + totalCount);
      return res.send(allCharacters.slice(myCounter, myCounter + 2));
    }

    seenCharacters.push({
      ip: myIpAddress,
      counter: counter
    });
    
    res.send(allCharacters.slice(counter, counter + 2));
    counter = counter + 2;
  }
});

/**
 * Update Votes
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
app.post('/api/vote', function(req, res) {
  var myIpAddress = req.header('x-forwarded-for') || req.connection.remoteAddress;
  var winner = req.body.winner;
  var loser = req.body.loser;

  // Validation check for multiple votes
  if (_.contains(votedCharacters , winner) &&
    _.contains(votedCharacters, loser)) {
    console.log('ALREADY VOTED!');
    return res.redirect('/');
    //eturn res.send(500, 'Already voted!');
  }
  
  // Add these two characters to global array to prevent multiple voting
  votedCharacters.push(winner);
  votedCharacters.push(loser);

  // Update wins and losses count in parallel using async library
  async.parallel({
    updateWinner: function(callback){
      Character.update({ characterId: winner }, { $inc: { wins: 1 } }, function(err) {
        if (err) {
          console.log('Error updating wins count.');
          return res.send(500, err);
        }
        console.log('Incrementing wins count of ', winner, ' by ', myIpAddress);
        callback(null);
      });
    },
    updateLoser: function(callback) {
      Character.update({ characterId: loser }, { $inc: { losses: 1 } }, function(err) {
        if (err) {
          console.log('Error updating losses count.');
          return res.send(500, err);
        }
        console.log('incrementing losses count of ', loser, ' by ', myIpAddress);
        callback(null);
      });
    }
  },
  function(err) {
    // TOODO: Verify that DB fail above bubles up this error object here
    if (err) {
      console.log(err);
      return res.send(500, err);
    }

    console.log('IP BUCKET before slice: ', seenCharacters);
    console.log('Pulling IP address from the bucket...');
    var index = seenCharacters.map(function(e) { return e.ip; }).indexOf(myIpAddress);
    seenCharacters.splice(index, 1);

    // TODO: remove comment counter += 2;
    return res.send(200, 'Wins and Losses have been updated');
  });
});




















/**
 * Top characters page
 * @param  {[type]} rhttp://127.0.0.1:8080/eq [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
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
    res.send(characters);
  });
});

/**
 * Returns all characters in the system
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
app.get('/api/characters/all', function(req, res) {
  Character
  .find()
  .select('name characterId')
  .exec(function(err, characters) {
    if (err) {
      console.log(err);
      return res.send(500, 'Error getting characters');
    }
    res.send(characters);
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
    res.send(characters);
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
    res.send(characters);
  });
});


app.get('/api/leaderboard', function(req, res) {
  Character
  .find()
  .sort('-wins')
  .limit(14)
  .exec(function(err, characters) {
    if (err) {
      console.log(err);
      return res.send(500, 'Error getting characters');
    }
    res.send(characters);
  });
});


app.post('/api/characters', function(req, res) {

  var charNameInput = req.body.name;
  // strip space characters
  charNameInput = charNameInput.replace(/\s/g, '%20');
  var characterIdUrl = 'https://api.eveonline.com/eve/CharacterID.xml.aspx?names=' + charNameInput;

  async.waterfall([
    function(callback){
      // get character id from character name
      request.get({ url: characterIdUrl }, function(err, r, body) {
        if (err) {
          console.log(err);
          return res.send(500, 'Error in retrieving character id');
        }

        parser.parseString(body, function(err, response) {
          
          if (!response.eveapi) {
            console.log('EVEAPI is not defined')
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

      async.parallel({
        one: function(callback){
          var filename32 = image32.replace(/^.*[\\\/]/, '');
          var filepath32 = path.join(__dirname, filename32);
          var writestream32 = gfs.createWriteStream({ filename: filename32 });
          var imageStream32 = request(image32).pipe(fs.createWriteStream(filepath32));

          imageStream32.on('close', function(err) {
            if (err) {
              console.log(err);
              return res.send(500, 'File error has occured');
            }
            var gridstream = fs.createReadStream(filepath32).pipe(writestream32);
            gridstream.on('close', function(err) {
              fs.unlink(filepath32);
              callback(null, filename32);
            });
          });
        },
        two: function(callback) {
          var filename64 = image64.replace(/^.*[\\\/]/, '');
          var filepath64 = path.join(__dirname, filename64);
          var writestream64 = gfs.createWriteStream({ filename: filename64 });
          var imageStream64 = request(image64).pipe(fs.createWriteStream(filepath64));

          imageStream64.on('close', function(err) {
            if (err) {
              console.log(err);
              return res.send(500, 'File error has occured');
            }
            var gridstream = fs.createReadStream(filepath64).pipe(writestream64);
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

          imageStream128.on('close', function(err) {
            if (err) {
              console.log(err);
              return res.send(500, 'File error has occured');
            }
            var gridstream = fs.createReadStream(filepath128).pipe(writestream128);
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

          imageStream256.on('close', function(err) {
            if (err) {
              console.log(err);
              return res.send(500, 'File error has occured');
            }
            var gridstream = fs.createReadStream(filepath256).pipe(writestream256);
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

          imageStream512.on('close', function(err) {
            if (err) {
              console.log(err);
              return res.send(500, 'File error has occured');
            }
            var gridstream = fs.createReadStream(filepath512).pipe(writestream512);
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
            console.log('EVEAPI is not defined')
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


app.del('/api/characters/:characterId', function(req, res) {
  Character.remove({ characterId: req.params.characterId }, function(err) {
    if (err) {
      console.log(err);
      return res.send(500, err);
    }

    console.log('Character has been removed');
    
    // Now remove image files associated with this character
    async.parallel({
      one: function(callback){
        var filename32 = req.params.characterId + '_32.jpg';
        gfs.remove({ filename: filename32 }, function (err) {
          if (err) {
            console.log('Error removing file from GridFS');
            return res.send(500, 'Failed to remove image from gridfs');
          }
          console.log('success removing 32px from gridfs!');
          callback(null);
        });
      },
      two: function(callback) {
        var filename64 = req.params.characterId + '_64.jpg';
        gfs.remove({ filename: filename64 }, function (err) {
          if (err) {
            console.log('Error removing file from GridFS');
            return res.send(500, 'Failed to remove image from gridfs');
          }
          console.log('success removing 64px from gridfs!');
          callback(null);
        });        
      },
      three: function(callback){
        var filename128 = req.params.characterId + '_128.jpg';
        gfs.remove({ filename: filename128 }, function (err) {
          if (err) {
            console.log('Error removing file from GridFS');
            return res.send(500, 'Failed to remove image from gridfs');
          }
          console.log('success removing 128px from gridfs!');
          callback(null);
        });   
      },
      four: function(callback){
        var filename256 = req.params.characterId + '_256.jpg';
        gfs.remove({ filename: filename256 }, function (err) {
          if (err) {
            console.log('Error removing file from GridFS');
            return res.send(500, 'Failed to remove image from gridfs');
          }
          console.log('success removing 256px from gridfs!');
          callback(null);
        });  
      },
      five: function(callback){
        var filename512 = req.params.characterId + '_512.jpg';
        gfs.remove({ filename: filename512 }, function (err) {
          if (err) {
            console.log('Error removing file from GridFS');
            return res.send(500, 'Failed to remove image from gridfs');
          }
          console.log('success removing 512px from gridfs!');
          callback(null);
        });
      }
    },
    function(err) {
      if (err) {
        console.log(err);
        return res.send(500, err);
      }
      console.log('Character and files have been removed successfully');

      return res.send(200, 'Character and files have been removed successfully');
    });
  });
});


app.get('/api/characters/:id', function(req, res) {
  Character.findOne({ characterId: req.params.id }, function(err, character) {
    if (err) {
      console.log(err);
      return res.send(500, err);
    }
    res.send(character);
  });
});

// PushState redirects
// 
app.get('/add', function(req, res) {
  res.redirect('/#add');
});

// app.get('/feedback', function(req, res) {
//   res.redirect('/#feedback');
// });

app.get('/top', function(req, res) {
  res.redirect('/#top');
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

