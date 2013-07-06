exports.report = function(req, res) {
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
};

exports.updateAvatar = function(req, res) {
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
};

exports.getAvatar = function(req, res) {
  var filename = req.params.filename;
  var gfs = Grid(mongoose.connection.db, mongoose.mongo);
  var readstream = gfs.createReadStream({
    filename: filename
  });
  readstream.pipe(res);
  readstream.on('error', function(err) {
    return res.send(500, 'Error while retriving a file from database');
  });
};

exports.getTotalCount = function(req, res) {
  Character.count({}, function(err, count) {
    if (err) {
      console.log('Error processing count');
      return res.send(500, err);
    }

    res.send({ count: count });
  });
};

exports.getTwoCharacters = function(req, res) {

  // todo
  // instead of shifting +2, randomly pick two and splice them from allCharacters

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
    console.log('Global: ' + counter + ' out of ' + allCharacters.length);
    nonces.push(randomString);

    if (_.contains(_.pluck(viewedCharacters, 'ip'), myIpAddress)) {
      console.log('Please vote before proceeding');
      var index = viewedCharacters.map(function(e) { return e.ip; }).indexOf(myIpAddress);
      console.log('Index', index);
      var myCounter = viewedCharacters[index].counter;
      console.log('MyCounter', myCounter);
      console.log('Personal: ' + myCounter + ' out of ' + allCharacters);
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
};

exports.vote = function(req, res) {

  // Verify that malicious user does not pass an empty POST data
  if (!req.body.winner || !req.body.loser) {
    return res.send(500, 'Winner or Loser IDs are invalid');
  }

  var myIpAddress = req.header('x-forwarded-for') || req.connection.remoteAddress;
  var winner = req.body.winner;
  var loser = req.body.loser;

  // Prevent users from voting for the same characters multiple times
  if (_.contains(votedCharacters , winner) || _.contains(votedCharacters, loser)) {
    console.log('ALREADY VOTED!');
    return res.redirect('/');
  }

  // Prevent users from chain-voting via an API console by verifying that
  // client nonce and server nonce match
  if (_.contains(nonces, req.body.nonce)) {
    nonces.splice(nonces.indexOf(req.body.nonce), 1);
  } else {
    console.log('NONCE MISMATCH');
    return res.redirect('/');
  }

  // After all potential malicious attacks have been handled
  // add both characters to the global array
  votedCharacters.push(winner, loser);

  // Update wins and losses count in parallel using async library
  async.parallel({
    updateWinner: function(callback){
      Character.update({ characterId: winner }, { $inc: { wins: 1 } }, function(err) {
        if (err) {
          console.log('Error updating wins count.');
          return res.send(500, err);
        }
        console.log('+1 ▴', winner, 'from', myIpAddress);
        callback(null);
      });
    },
    updateLoser: function(callback) {
      Character.update({ characterId: loser }, { $inc: { losses: 1 } }, function(err) {
        if (err) {
          console.log('Error updating losses count.');
          return res.send(500, err);
        }
        console.log('+1 ▾', loser, 'from', myIpAddress);
        callback(null);
      });
    }
  },
  function(err) {
    if (err) {
      console.log(err);
      return res.send(500, 'Error updating wins and losses count');
    }

    // After the successful voting remove current IP addres from [viewedCharacters]
    // so that user does not get stuck on the same two characters
    var index = viewedCharacters.map(function(e) { return e.ip; }).indexOf(myIpAddress);
    viewedCharacters.splice(index, 1);

    return res.send(200, 'Wins and Losses have been updated');
  });
};

exports.getWorstCharacters = function(req, res) {
  Character
  .find()
  .sort('-losses')
  .limit(25)
  .exec(function(err, characters) {
    if (err) {
      console.log(err);
      return res.send(500, 'Error getting characters');
    }
    res.send({ characters: characters});
  });
};

exports.getTop = function(req, res) {
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
};

exports.getAll = function(req, res) {
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
};

exports.topByRace = function(req, res) {
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
};

exports.topByBloodline = function(req, res) {
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
};

exports.leaderboard = function(req, res) {
  Character
  .find()
  .sort('-wins')
  .limit(14)
  .exec(function(err, characters) {
    if (err) {
      console.log(err);
      return res.send(500, 'Error getting characters');
    }
    res.send({ characters: characters});
  });
};

exports.newCharacter = function(req, res) {

  var charNameInput = req.body.name;
  charNameInput = charNameInput.replace(/\s/g, '%20'); // strip space characters
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
};

exports.deleteCharacter = function(req, res) {
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
};

exports.getCharacter = function(req, res) {
  Character.findOne({ characterId: req.params.id }, function(err, character) {
    if (err) {
      console.log(err);
      return res.send(500, err);
    }
    res.send(character);
  });
};

