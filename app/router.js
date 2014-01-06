define(function(require, exports, module) {
  var _ = require('underscore');
  var $ = require('jquery');
  var Backbone = require('backbone');
  var CharacterModel = require('modules/CharacterModel');
  var BrowseCollection = require('modules/BrowseCollection');
  var CharacterCollection = require('modules/CharacterCollection');
  var CharacterCollectionView = require('modules/CharacterCollectionView');
  var CharacterSummaryView = require('modules/CharacterSummaryView');
  var SearchView = require('modules/SearchView');
  var LeaderboardView = require('modules/LeaderboardView');
  var HomeView = require('modules/HomeView');
  var WrongGenderView = require('modules/WrongGenderView');
  var AddCharacterView = require('modules/AddCharacterView');
  var StatsView = require('modules/StatsView');
  var BrowseView = require('modules/BrowseView');

  module.exports = Backbone.Router.extend({
    initialize: function() {

      $.get('/api/characters/all', function(data) {
        var searchView = new SearchView({
          count: data.count
        });
      });

      var characters = new CharacterCollection();

      characters.fetch({
        url: '/api/leaderboard',
        success: function(data) {
          var leaderboardView = new LeaderboardView({
            collection: data
          });
          $('.footer #leaderboard').html(leaderboardView.render().el);
        }
      });
    },
    routes: {
      '': 'home',
      'add': 'addCharacter',
      'new': 'newCharacters',
      'top': 'topCharacters',
      'male': 'maleCharacters',
      'female': 'femaleCharacters',
      'stats': 'stats',
      'wrong-gender': 'wrongGender',
      'hall-of-shame': 'hallOfShame',
      'top/:race': 'topRace',
      'male/:race': 'maleRace',
      'female/:race': 'femaleRace',
      'characters/:id': 'characterDetails',
      'top/:race/:bloodline': 'topBloodline',
      'male/:race/:bloodline': 'maleBloodline',
      'female/:race/:bloodline': 'femaleBloodline',

      'browse(/:gender)(/:race)(/:bloodline)': 'browse'

    },

    browse: function(gender, race, bloodline) {
      var characters = new BrowseCollection();

      var browseView = new BrowseView({
        collection: characters,
        gender: gender,
        race: race,
        bloodline: bloodline
      });

      $('#content').html(browseView.render().el);
      browseView.selectMenuItem('browse-menu');
    },

    stats: function() {
      $.get('/api/stats', function(data) {
        var statsView = new StatsView({
          stats: data
        });
        $('#content').html(statsView.render().el);
        statsView.selectMenuItem('stats-menu');
      });
    },

    home: function() {
      var characters = new CharacterCollection();
      characters.fetch({
        success: function(data) {

          var homeView = new HomeView({
            collection: data
          });

          $('#content').html(homeView.render().el);
          homeView.selectMenuItem('home-menu');
        }
      });
    },

    newCharacters: function() {
      var characters = new CharacterCollection();
      characters.fetch({
        url: '/api/characters/new',
        error: function() { console.log('Error Not Implemented'); },
        success: function(data) {
          var characterCollectionView = new CharacterCollectionView({
            collection: characters
          });
          $('#content').html('<div class="panel"></div>');
          $('.panel').html(characterCollectionView.render().el);
          characterCollectionView.selectMenuItem('new-menu');
        }
      });
    },

    topBloodline: function(race, bloodline) {
      var characters = new CharacterCollection();
      characters.fetch({
        url: '/api/characters/top?race=' + race + '&bloodline=' + bloodline,
        success: function(data) {
          var characterCollectionView = new CharacterCollectionView({
            collection: characters
          });
          $('#content').html('<div class="panel"></div>');
          $('.panel').html(characterCollectionView.render().el);
          characterCollectionView.selectMenuItem('top-menu');
        }
      });
    },

    topCharacters: function() {
      var characters = new CharacterCollection();
      characters.fetch({
        url: '/api/characters/top',
        success: function(data) {
          var characterCollectionView = new CharacterCollectionView({
            collection: characters
          });
          $('#content').html('<div class="panel"></div>');
          $('.panel').html(characterCollectionView.render().el);
          characterCollectionView.selectMenuItem('top-menu');
        }
      });
    },

    wrongGender: function() {
      var characters = new CharacterCollection();
      characters.fetch({
        url: '/api/characters/wrong-gender',
        success: function(data) {
          var wrongGenderView = new WrongGenderView({
            collection: characters
          });
          $('#content').html(wrongGenderView.render().el);
          wrongGenderView.selectMenuItem('top-menu');
        }
      });
    },

    hallOfShame: function() {
      var characters = new CharacterCollection();
      characters.fetch({
        url: '/api/characters/shame',
        success: function() {
          var characterCollectionView = new CharacterCollectionView({
            collection: characters
          });
          $('#content').html('<div class="panel"></div>');
          $('.panel').html(characterCollectionView.render().el);
          characterCollectionView.selectMenuItem('hall-of-shame-menu');
        }
      });
    },

    topRace: function(race) {
      var characters = new CharacterCollection();
      characters.fetch({
        url: '/api/characters/top/?race=' + race,
        success: function(data) {
          var characterCollectionView = new CharacterCollectionView({
            collection: characters
          });
          $('#content').html('<div class="panel"></div>');
          $('.panel').html(characterCollectionView.render().el);
          characterCollectionView.selectMenuItem('top-menu');
        }
      });
    },

    maleRace: function(race) {
      var characters = new CharacterCollection();
      characters.fetch({
        url: '/api/characters/top?gender=male&race=' + race,
        success: function(data) {
          var characterCollectionView = new CharacterCollectionView({
            collection: characters
          });
          $('#content').html('<div class="panel"></div>');
          $('.panel').html(characterCollectionView.render().el);
          characterCollectionView.selectMenuItem('top-male');
        }
      });
    },

    femaleRace: function(race) {
      var characters = new CharacterCollection();
      characters.fetch({
        url: '/api/characters/top?gender=female&race=' + race,
        success: function(data) {
          var characterCollectionView = new CharacterCollectionView({
            collection: characters
          });
          $('#content').html('<div class="panel"></div>');
          $('.panel').html(characterCollectionView.render().el);
          characterCollectionView.selectMenuItem('top-female');
        }
      });
    },


    maleBloodline: function(race, bloodline) {
      var characters = new CharacterCollection();
      characters.fetch({
        url: '/api/characters/top?gender=male&race=' + race + '&bloodline=' + bloodline,
        success: function(data) {
          var characterCollectionView = new CharacterCollectionView({
            collection: characters
          });
          $('#content').html('<div class="panel"></div>');
          $('.panel').html(characterCollectionView.render().el);
          characterCollectionView.selectMenuItem('top-male');
        }
      });
    },

    femaleBloodline: function(race, bloodline) {
      var characters = new CharacterCollection();
      characters.fetch({
        url: '/api/characters/top?gender=female&race=' + race + '&bloodline=' + bloodline,
        success: function(data) {
          var characterCollectionView = new CharacterCollectionView({
            collection: characters
          });
          $('#content').html('<div class="panel"></div>');
          $('.panel').html(characterCollectionView.render().el);
          characterCollectionView.selectMenuItem('top-female');
        }
      });
    },

    maleCharacters: function() {
      var characters = new CharacterCollection();
      characters.fetch({
        url: '/api/characters/top?gender=male',
        success: function(data) {
          var characterCollectionView = new CharacterCollectionView({
            collection: characters
          });
          $('#content').html('<div class="panel"></div>');
          $('.panel').html(characterCollectionView.render().el);
          characterCollectionView.selectMenuItem('top-male');
        }
      });
    },

    femaleCharacters: function() {
      var characters = new CharacterCollection();
      characters.fetch({
        url: '/api/characters/top?gender=female',
        success: function(data) {
          var characterCollectionView = new CharacterCollectionView({
            collection: characters
          });
          $('#content').html('<div class="panel"></div>');
          $('.panel').html(characterCollectionView.render().el);
          characterCollectionView.selectMenuItem('top-female');
        }
      });
    },

    addCharacter: function() {
      var addCharacterView = new AddCharacterView();
      addCharacterView.selectMenuItem('add-menu');
      $('#content').html(addCharacterView.render().el);
    },

    characterDetails: function (id) {
      var character = new CharacterModel({ characterId: id });
      character.fetch({
        error: function(data) {
          $('#content').html('<h2 class="lead">404: Not Found</h1>')
        },
        success: function(data) {
          var winLossRatio = (data.get('wins') / (data.get('wins') + data.get('losses')) * 100).toFixed(1);
          if (isNaN(winLossRatio)) winLossRatio = 0;
          var characterSummaryView = new CharacterSummaryView({ model: data, winLossRatio: winLossRatio });
          $('#content').html(characterSummaryView.render().el);
          $('#wrap').css('background-image', 'url(../img/' + data.get('race') + '-bg.jpg)');
          $('.navbar').addClass('bg').addClass('bg-black');
          $('.footer').addClass('transparent');
          $('.dropdown-menu').addClass('bg-inverse');
          characterSummaryView.selectMenuItem();
        }
      });
    }
  });
});
