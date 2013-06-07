
/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    path = require('path'),
    request = require('request'),
    xml2js = require('xml2js'),
    mongoose = require('mongoose');

/**
 * App Initialization
 */
var app = express();
var parser = new xml2js.Parser();
mongoose.connect('localhost');

/**
 * DB Schema and Model
 */
var Character = mongoose.model('Character', {
  characterId: { type: String, unique: true },
  name: String,
  image32: String,
  image64: String,
  image128: String,
  image256: String,
  image512: String,
  race: String,
  bloodline: String,
  rating: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 }
});


// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/characters', function(req, res) {
  Character.find(function(err, characters) {
    res.send(characters);
  });
});

app.post('/characters', function(req, res) {

});

app.get('/characters/:name', function(req, res) {
  var name = req.params.name.replace(/[-+]/g, ' ');
  Character.findOne({ name: name }, function(err, character) {
    res.send(character);
  });
});


// app.get('/add', function(req, res) {
//   res.render('add');
// });


app.post('/add', function(req, res) {
  var characterName = req.body.charName || 'Nova Kierra';
  var characterIdUrl = 'https://api.eveonline.com/eve/CharacterID.xml.aspx?names=' + characterName;

  // get character id from name
  request.get({ url: characterIdUrl }, function(e, r, body) {
    parser.parseString(body, function(err, response) {
      var characterId = response.eveapi.result[0].rowset[0].row[0].$.characterID;
      var image32 = 'https://image.eveonline.com/Character/' + characterId + '_32.jpg';
      var image64 = 'https://image.eveonline.com/Character/' + characterId + '_64.jpg';
      var image128 = 'https://image.eveonline.com/Character/' + characterId + '_128.jpg';
      var image256 = 'https://image.eveonline.com/Character/' + characterId + '_256.jpg';
      var image512 = 'https://image.eveonline.com/Character/' + characterId + '_512.jpg';


      var characterInfoUrl = 'https://api.eveonline.com/eve/CharacterInfo.xml.aspx?characterID=' + characterId;

      // get character info: race, bloodline, etc.
      request.get({ url: characterInfoUrl }, function(e, r, body) {
        parser.parseString(body, function(err, response) {
          var race = response.eveapi.result[0].race[0];
          var bloodline = response.eveapi.result[0].bloodline[0];

          // TODO: Check if character is already in the DB
          // save to DB
          var character = new Character({
            characterId: characterId,
            name: characterName,
            image32: image32,
            image64: image64,
            image128: image64,
            image256: image256,
            image512: image512,
            race: race,
            bloodline: bloodline
          });

          character.save(function(err) {
            console.log('saved successfully');
            res.send(character);
          });
        });
      });

    });
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
