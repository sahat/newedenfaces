define(function(require, exports, module) {
  var Backbone = require("backbone");

  module.exports = Backbone.Router.extend({
    routes: {
      '': 'home',
      'add': 'addCharacter',
      'top': 'topCharacters',
      'male': 'maleCharacters',
      'female': 'femaleCharacters',
      'wrong-gender': 'wrongGender',
      'hall-of-shame': 'hallOfShame',
      'top/:race': 'topRace',
      'male/:race': 'maleRace',
      'female/:race': 'femaleRace',
      'characters/:id': 'characterDetails',
      'top/:race/:bloodline': 'topBloodline',
      'male/:race/:bloodline': 'maleBloodline',
      'female/:race/:bloodline': 'femaleBloodline'
    },

    home: function() {
      var characters = new App.Collections.Characters();
      characters.fetch({
        success: function(data) {

          App.Views.homeView = new App.Views.Home({
            collection: data
          });

          $('#content').html(App.Views.homeView.render().el);
          App.Views.homeView.selectMenuItem('home-menu');
        }
      });
    },

    topBloodline: function(race, bloodline) {
      var characters = new App.Collections.Characters();
      characters.fetch({
        url: '/api/characters/top?race=' + race + '&bloodline=' + bloodline,
        success: function(data) {
          App.Views.charactersView = new App.Views.Characters({
            collection: characters
          });
          $('#content').html('<div class="panel"></div>');
          $('.panel').html(App.Views.charactersView.render().el);
          App.Views.charactersView.selectMenuItem('top-menu');
        }
      });
    },

    topCharacters: function() {
      var characters = new App.Collections.Characters();
      characters.fetch({
        url: '/api/characters/top',
        success: function(data) {
          App.Views.charactersView = new App.Views.Characters({
            collection: characters
          });
          $('#content').html('<div class="panel"></div>');
          $('.panel').html(App.Views.charactersView.render().el);
          App.Views.charactersView.selectMenuItem('top-menu');
        }
      });
    },

    wrongGender: function() {
      var characters = new App.Collections.Characters();
      characters.fetch({
        url: '/api/characters/wrong-gender',
        success: function(data) {
          App.Views.wrongGenderView = new App.Views.WrongGender({
            collection: characters
          });
          $('#content').html(App.Views.wrongGenderView.render().el);
          App.Views.wrongGenderView.selectMenuItem('top-menu');
        }
      });
    },

    hallOfShame: function() {
      var characters = new App.Collections.Characters();
      characters.fetch({
        url: '/api/characters/shame',
        success: function() {
          App.Views.charactersView = new App.Views.Characters({
            collection: characters
          });
          $('#content').html('<div class="panel"></div>');
          $('.panel').html(App.Views.charactersView.render().el);
          App.Views.charactersView.selectMenuItem('hall-of-shame-menu');
        }
      });
    },

    topRace: function(race) {
      var characters = new App.Collections.Characters();
      characters.fetch({
        url: '/api/characters/top/?race=' + race,
        success: function(data) {
          App.Views.charactersView = new App.Views.Characters({
            collection: characters
          });
          $('#content').html('<div class="panel"></div>');
          $('.panel').html(App.Views.charactersView.render().el);
          App.Views.charactersView.selectMenuItem('top-menu');
        }
      });
    },

    maleRace: function(race) {
      var characters = new App.Collections.Characters();
      characters.fetch({
        url: '/api/characters/top?gender=male&race=' + race,
        success: function(data) {
          App.Views.charactersView = new App.Views.Characters({
            collection: characters
          });
          $('#content').html('<div class="panel"></div>');
          $('.panel').html(App.Views.charactersView.render().el);
          App.Views.charactersView.selectMenuItem('top-male');
        }
      });
    },

    femaleRace: function(race) {
      var characters = new App.Collections.Characters();
      characters.fetch({
        url: '/api/characters/top?gender=female&race=' + race,
        success: function(data) {
          App.Views.charactersView = new App.Views.Characters({
            collection: characters
          });
          $('#content').html('<div class="panel"></div>');
          $('.panel').html(App.Views.charactersView.render().el);
          App.Views.charactersView.selectMenuItem('top-female');
        }
      });
    },


    maleBloodline: function(race, bloodline) {
      var characters = new App.Collections.Characters();
      characters.fetch({
        url: '/api/characters/top?gender=male&race=' + race + '&bloodline=' + bloodline,
        success: function(data) {
          App.Views.charactersView = new App.Views.Characters({
            collection: characters
          });
          $('#content').html('<div class="panel"></div>');
          $('.panel').html(App.Views.charactersView.render().el);
          App.Views.charactersView.selectMenuItem('top-male');
        }
      });
    },

    femaleBloodline: function(race, bloodline) {
      var characters = new App.Collections.Characters();
      characters.fetch({
        url: '/api/characters/top?gender=female&race=' + race + '&bloodline=' + bloodline,
        success: function(data) {
          App.Views.charactersView = new App.Views.Characters({
            collection: characters
          });
          $('#content').html('<div class="panel"></div>');
          $('.panel').html(App.Views.charactersView.render().el);
          App.Views.charactersView.selectMenuItem('top-female');
        }
      });
    },

    maleCharacters: function() {
      var characters = new App.Collections.Characters();
      characters.fetch({
        url: '/api/characters/top?gender=male',
        success: function(data) {
          App.Views.charactersView = new App.Views.Characters({
            collection: characters
          });
          $('#content').html('<div class="panel"></div>');
          $('.panel').html(App.Views.charactersView.render().el);
          App.Views.charactersView.selectMenuItem('top-male');
        }
      });
    },

    femaleCharacters: function() {
      var characters = new App.Collections.Characters();
      characters.fetch({
        url: '/api/characters/top?gender=female',
        success: function(data) {
          App.Views.charactersView = new App.Views.Characters({
            collection: characters
          });
          $('#content').html('<div class="panel"></div>');
          $('.panel').html(App.Views.charactersView.render().el);
          App.Views.charactersView.selectMenuItem('top-female');
        }
      });
    },

    addCharacter: function() {
      var addCharacterView = new App.Views.AddCharacter();
      addCharacterView.selectMenuItem('add-menu');
      $('#content').html(addCharacterView.render().el);
    },

    characterDetails: function (id) {
      var character = new App.Models.Character({ characterId: id });
      character.fetch({
        error: function(err) {
          console.log(err, 'error');
        },
        success: function(data) {
          var winLossRatio = (data.get('wins') / (data.get('wins') + data.get('losses')) * 100).toFixed(1);
          if (isNaN(winLossRatio)) winLossRatio = 0;
          var characterSummaryView = new App.Views.CharacterSummary({ model: data, winLossRatio: winLossRatio });
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
