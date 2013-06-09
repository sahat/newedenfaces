#!/bin/env node
/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    fs = require('fs'),
    path = require('path'),
    request = require('request'),
    xml2js = require('xml2js'),
    mongoose = require('mongoose'),
    SendGrid = require('sendgrid').SendGrid;


var NewEdenFaces = function() {
  var self = this;


  /*  ================================================================  */
  /*  Helper functions.                                                 */
  /*  ================================================================  */

  /**
   *  Set up server IP address and port # using env variables/defaults.
   */
  self.setupVariables = function() {
      //  Set the environment variables we need.
      self.ipaddress = process.env.OPENSHIFT_NODEJS_IP ||
                       process.env.OPENSHIFT_INTERNAL_IP;
      self.port      = process.env.OPENSHIFT_NODEJS_PORT   ||
                       process.env.OPENSHIFT_INTERNAL_PORT || 8080;

      if (typeof self.ipaddress === "undefined") {
          //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
          //  allows us to run/test the app locally.
          console.warn('No OPENSHIFT_*_IP var, using 127.0.0.1');
          self.ipaddress = "127.0.0.1";
      };
  };

  /**
   *  terminator === the termination handler
   *  Terminate server on receipt of the specified signal.
   *  @param {string} sig  Signal to terminate on.
   */
  self.terminator = function(sig){
      if (typeof sig === "string") {
         console.log('%s: Received %s - terminating sample app ...',
                     Date(Date.now()), sig);
         process.exit(1);
      }
      console.log('%s: Node server stopped.', Date(Date.now()) );
  };

  /**
   *  Setup termination handlers (for exit and a list of signals).
   */
  self.setupTerminationHandlers = function(){
      //  Process on exit and signals.
      process.on('exit', function() { self.terminator(); });

      // Removed 'SIGPIPE' from the list - bugz 852598.
      ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
       'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
      ].forEach(function(element, index, array) {
          process.on(element, function() { self.terminator(element); });
      });
  };

  /**
  *  Initialize the server (express) and create the routes and register
  *  the handlers.
  */
  self.initializeServer = function() {
    app = express();

    /**
     * App Initialization
     */
    var parser = new xml2js.Parser();
    mongoose.connect('mongodb://sahat:newedenfaces@ds029638.mongolab.com:29638/newedenfaces');

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
      gender: String,
      bloodline: String,
      rating: { type: Number, default: 1400 },
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 }
    });


    // all environments
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon(__dirname + '/public/favicon.ico')); 
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

    //  Add handlers for the app (from the routes).
    app.put('/characters/:id', function(req, res) {
      Character.findById(req.body._id, function(err, character) {
        character.wins = req.body.wins;
        character.losses = req.body.losses;
        character.rating = req.body.rating;
        character.save(function(err) {
          res.send(200);
        });
      });
    });

    app.get('/characters', function(req, res) {
      Character.find(function(err, characters) {
        res.send(characters);
      });
    });

    app.post('/characters', function(req, res) {
      var characterIdUrl = 'https://api.eveonline.com/eve/CharacterID.xml.aspx?names=' + req.body.name;

      // get character id from name
      request.get({ url: characterIdUrl }, function(e, r, body) {
        parser.parseString(body, function(err, response) {
          if (response.eveapi.error) {
            return res.send(404);
          };

          var characterId = response.eveapi.result[0].rowset[0].row[0].$.characterID;
          var image32 = 'https://image.eveonline.com/Character/' + characterId + '_32.jpg';
          var image64 = 'https://image.eveonline.com/Character/' + characterId + '_64.jpg';
          var image128 = 'https://image.eveonline.com/Character/' + characterId + '_128.jpg';
          var image256 = 'https://image.eveonline.com/Character/' + characterId + '_256.jpg';
          var image512 = 'https://image.eveonline.com/Character/' + characterId + '_512.jpg';

          // check if already exists
          Character.findOne({'characterId': characterId }, function(err, character) {
            if (character) {
              return res.send(409);
            }
          });
          // otherwise proceed

          var characterInfoUrl = 'https://api.eveonline.com/eve/CharacterInfo.xml.aspx?characterID=' + characterId;

          // get character info: race, bloodline, etc.
          request.get({ url: characterInfoUrl }, function(e, r, body) {
            parser.parseString(body, function(err, response) {
              if (response.eveapi.error) {
                return res.send(404);
              };
              var race = response.eveapi.result[0].race[0];
              var bloodline = response.eveapi.result[0].bloodline[0];
              var characterName = response.eveapi.result[0].characterName[0];
              // TODO: Check if character is already in the DB
              // save to DB
              var character = new Character({
                characterId: characterId,
                name: characterName,
                race: race,
                bloodline: bloodline,
                image32: image32,
                image64: image64,
                image128: image64,
                image256: image256,
                image512: image512
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


    app.post('/characters/:name', function(req, res) {
      console.log(req.params.name);
    });

    app.get('/characters/:name', function(req, res) {
      var name = req.params.name.replace(/[-+]/g, ' ');
      Character.findOne({ name: name }, function(err, character) {
        res.send(character);
      });
    });


    app.post('/feedback', function(req, res) {
      var sendgrid = new SendGrid('sahat', '');
      var characterName = req.body.characterName;
      var message = req.body.message;
      var uiRating = req.body.uiRating;
      var text = 'From: ' + characterName + '.' + 'User Interface: ' +
                  uiRating + '.' + 'Message: ' + message + '.';
      
      sendgrid.send({
        to: 'sakhat@gmail.com',
        from: 'aura@neweden.com',
        subject: 'Site Feedback',
        text: text
      }, function(success, message) {
        if (!success) {
          console.log(message);
        }
        res.send('Email has been sent successfully');
      });
    });
  };

  /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };
};

var zapp = new NewEdenFaces();
zapp.initialize();
zapp.start();

