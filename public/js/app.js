/* globals Backbone */
/* globals _ */
/* globals App */
/* globals toastr */

window.App = {
  Models: {},
  Views: {},
  Collections: {}
};

/**
 * Character Model
 * @description Stores JSON data about an individual character
 */
App.Models.Character = Backbone.Model.extend({
  urlRoot: '/api/characters',
  idAttribute: 'characterId'
});

/**
 * Characters Collection
 * @description An array of characters
 */
App.Collections.Characters = Backbone.Collection.extend({
  model: App.Models.Character,
  url: '/api/characters'
});

/**
 * Home View
 * @description The main page
 */
App.Views.Home = Backbone.View.extend({
  tagName: 'ul',
  className: 'thumbnails',
  template: _.template($('#home-template').html()),
  initialize: function() {
    _.bindAll(this, 'vote');
    this.collection.on('change:wins', this.vote, this);
  },
  render: function() {
    this.$el.html(this.template());
    this.collection.each(this.addOne, this);
    return this;
  },
  vote: function(winner) {
    var loser = this.collection.at(Math.abs(1 - this.collection.indexOf(winner)));
    loser.set('losses', loser.get('losses') + 1);
    // TODO: remove self, test if it still works
    var self = this;
    $.ajax({
      url: '/api/characters',
      type: 'PUT',
      data: {
        winner: winner.get('characterId'),
        loser: loser.get('characterId')
      },
      success: function() {
        self.collection.fetch({
          url: '/api/characters',
          success: function(data) {
            if (data.length < 2) {
              self.$el.html('<div class="alert alert-info">Nothing to display</div>');
            } else {
              self.render();
            }
          }
        });
      }
    });
  },
  addOne: function(character, index) {
    var characterThumbnailView = new App.Views.CharacterThumbnail({ model: character });
    // add bootstrap offset3 to the first thumbnail
    if (index === 0) {
      characterThumbnailView.$el.addClass('offset1');
    }
    this.$el.append(characterThumbnailView.render().el);
  },
  selectMenuItem: function(menuItem) {
    $('.navbar .nav li').removeClass('active');
    if (menuItem) {
      $('.' + menuItem).addClass('active');
    }
  }

});

// Character Thumbnail on the Home Page View
App.Views.CharacterThumbnail = Backbone.View.extend({
  tagName: 'li',
  className: 'span5',
  template: _.template($('#character-thumbnail-template').html()),
  events: {
    'click img': 'updateWinner'
  },
  render: function () {
    this.$el.html(this.template(this.model.toJSON()));
    this.$el.find('img').on('dragstart', function(e) {
      e.preventDefault();
    });
    return this;
  },
  updateWinner: function() {
    this.model.set('wins', this.model.get('wins') + 1);
  }
});


// Footer leaderboard view on home page
App.Views.Leaderboard = Backbone.View.extend({

  tagName: 'ul',

  className: 'inline',

  render: function() {

    this.collection.each(function(character) {
      var leaderboardItemView = new App.Views.LeaderboardItem({ model: character });
      this.$el.append(leaderboardItemView.render().el);
    }, this);
    
    return this;
  }

});

// individual leaderboard item
App.Views.LeaderboardItem = Backbone.View.extend({

  tagName: 'li',

  template: _.template($('#leaderboard-item-template').html()),

  render: function () {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }

});


// Character View
App.Views.Character = Backbone.View.extend({

  tagName: 'li',

  className: 'list-group-item',

  template: _.template($('#character-template').html()),

  render: function () {
    var data = {
      model: this.model.toJSON(),
      position: this.options.position
    };

    this.$el.html(this.template(data));
    return this;
  }

});

// Character View with Gender buttons
App.Views.CharacterGender = Backbone.View.extend({

  tagName: 'li',

  className: 'media',

  template: _.template($('#gender-template').html()),

  events: {
    'click #female': 'female',
    'click #male': 'male'
  },

  render: function () {
    var data = {
      model: this.model.toJSON(),
      position: this.options.position
    };

    this.$el.html(this.template(data));
    return this;
  },

  female: function() {
    var self = this;
    self.$el.remove();
    $.post('/api/gender', { characterId: this.model.get('characterId'), gender: 'female' }, function(data) {
      return false;
    });
  },


  male: function() {
    var self = this;
    self.$el.remove();
    $.post('/api/gender', { characterId: this.model.get('characterId'), gender: 'male' }, function(data) {
      return false;
    });
  }

});


// Character View for Wrong Gender
App.Views.WrongGender = Backbone.View.extend({

  tagName: 'li',

  className: 'media',

  template: _.template($('#menu-leaderboard-template').html()),

  selectMenuItem: function(menuItem) {
    $('.navbar .nav li').removeClass('active');
    if (menuItem) {
      $('.' + menuItem).addClass('active');
    }
  },

  addOne: function(character, index) {
    // create new character view
    var characterView = new App.Views.CharacterGender({ model: character, position: index + 1 });
    // apend to <tbody>
    this.$el.append(characterView.render().el);
  },

  render: function() {
    $('#content').html(this.template());
    this.collection.each(this.addOne, this);
    return this;
  }

});


// Characters Collection View
App.Views.Characters = Backbone.View.extend({
  tagName: 'ul',
  className: 'list-group list-group-flush',
  template: _.template($('#menu-leaderboard-template').html()),
  selectMenuItem: function(menuItem) {
    $('.navbar .nav li').removeClass('active');
    if (menuItem) {
      $('.' + menuItem).addClass('active');
    }
  },
  addOne: function(character, index) {
    // create new character view
    var characterView = new App.Views.Character({ model: character, position: index + 1 });
    // apend to <tbody>
    this.$el.append(characterView.render().el);
  },
  render: function() {
    this.collection.each(this.addOne, this);
    return this;
  }
});

// CharactersGender Collection View
App.Views.CharactersGender = Backbone.View.extend({

  tagName: 'ul',

  className: 'media-list',

  template: _.template($('#menu-leaderboard-template').html()),

  selectMenuItem: function(menuItem) {
    $('.navbar .nav li').removeClass('active');
    if (menuItem) {
      $('.' + menuItem).addClass('active');
    }
  },

  addOne: function(character, index) {
    // create new character view
    var characterView = new App.Views.Character({ model: character, position: index + 1 });
    // apend to <tbody>
    this.$el.append(characterView.render().el);
  },

  render: function() {
    $('#content').html(this.template());
    this.collection.each(this.addOne, this);
    return this;
  }

});

// Character Summary View
App.Views.CharacterSummary = Backbone.View.extend({

  template: _.template($('#character-summary-template').html()),

  events: {
    'click #report': 'reportPlayer',
    'click #wrong-gender': 'wrongGender',
  },

  wrongGender: function() {
    var characterId = this.model.get('characterId');
    $.post('/api/report/gender', { characterId: characterId }, function(data) {
      toastr.info('Your report has been submitted');
    });
  },

  reportPlayer: function(e) {
    var $reportButton = this.$el.find('#report');
    var characterId = this.model.get('characterId');
    $.post('/api/report', this.model.toJSON(), function(data) {

      // JavaScript way of checking if string contains a substring
      if (data.indexOf('deleted') !== -1) { // contains deleted
        toastr.error(data);
        Backbone.history.navigate('/', { trigger: true });
      } else if (data.indexOf('reported') !== -1) { // contains reported
        toastr.warning(data);
      }

      // Prevents users from reporting multiple times
      $reportButton.attr('disabled', true);
      localStorage['reported-' + characterId] = 'True';
    });
  },

  render: function () {
    var data = {
      model: this.model.toJSON(),
      winLossRatio: this.options.winLossRatio
    };

    this.$el.html(this.template(data));

    if (localStorage['reported-'+this.model.get('characterId')] === 'True') {
      this.$el.find('#report').attr('disabled', true);
    }

    this.$el.find('.magnific-popup').magnificPopup({
      type: 'image',
      closeOnContentClick: true,
      mainClass: 'my-mfp-zoom-in'
    });

    return this;
  },

  selectMenuItem: function(menuItem) {
    $('.navbar .nav li').removeClass('active');
    if (menuItem) {
      $('.' + menuItem).addClass('active');
    }
  }

});


// Search View
App.Views.Search = Backbone.View.extend({

  el: $('.navbar'),

  initialize: function() {
    $('#search').typeahead({
      source: this.collection.pluck('name')
    });
    $('#search').attr('placeholder', this.collection.length + ' capsuleers');
  },

  events: {
    'submit form': 'submit'
  },

  submit: function(e) {
    e.preventDefault();
    var input = this.$el.find('input').val();

    var queryMatch = this.collection.filter(function(model) {
      return model.get('name').toLowerCase() === input.toLowerCase();
    });

    if (!queryMatch.length) {
      return toastr.warning('Search input cannot be empty');
    }
    var characterId = queryMatch[0].get('characterId');

    if (characterId) {
      Backbone.history.navigate('/characters/' + characterId, { trigger: true });
    } else {
      toastr.warning('No query match');
    }
  }

});

// Add Character View
App.Views.AddCharacter = Backbone.View.extend({

  template: _.template($('#add-character-template').html()),

  events: {
    "submit form":"submit"
  },

  render:function () {
    this.$el.html(this.template());
    return this;
  },

  submit: function(e) {
    e.preventDefault();

    var helpBlock = this.$el.find('.help-block');
    var controlGroup = this.$el.find('.control-group');
    var inputField = this.$el.find('input[name=addcharacter]');
    var submitBtn = this.$el.find('button');
    var gender = this.$el.find('input:radio[name=genderRadios]:checked').val();

    if (!gender) {
      return toastr.error('Please specify character\'s gender');
    }

    var newCharacter = new App.Models.Character({
      name: inputField.val(),
      gender: gender
    });


    newCharacter.save(null, {
      success: function() {
        Backbone.history.navigate('#', { trigger: true });
        toastr.success('Character has been added successfully');
      },
      error: function(model, response) {
        controlGroup.addClass('error');
        submitBtn.removeClass('btn-primary').addClass('btn-danger');
        submitBtn.button('reset');
        inputField.focus();

        if (response.status === 409) {
            helpBlock.html('<a href="/characters/' + response.responseJSON.characterId + '">' + model.get('name') + '</a> is already in our system.');
        } else {
            helpBlock.text('Oops, ' + inputField.val() + ' is not a registered citizen of New Eden.');
        }
      }
    });
  },

  selectMenuItem: function(menuItem) {
    $('.navbar .nav li').removeClass('active');
    if (menuItem) {
      $('.' + menuItem).addClass('active');
    }
  }

});

App.Router = Backbone.Router.extend({

  initialize: function() {
    $('#content').html(
      '<div class="loading">' +
        '<div class="track"></div>' +
        '<div class="spinner">' +
          '<div class="mask">' +
            '<div class="maskedCircle"></div>' +
          '</div>' +
      '</div>');
    var characters = new App.Collections.Characters();
    characters.fetch({
      url: '/api/characters/all',
      success: function(data) {
        var searchView = new App.Views.Search({
          collection: characters
        });
      }
    });
    characters.fetch({
      url: '/api/leaderboard',
      success: function(data) {
        App.Views.leaderboardView = new App.Views.Leaderboard({
          collection: data
        });
        $('.footer #leaderboard').html(App.Views.leaderboardView.render().el);
      }
    });
  },

  routes: {
    '':                     'home',
    'hall-of-shame':        'hallOfShame',
    'top':                  'topCharacters',
    'male':                 'maleCharacters',
    'female':               'femaleCharacters',
    'top/:race':            'topRace',
    'male/:race':           'maleRace',
    'female/:race':         'femaleRace',
    'top/:race/:bloodline': 'topBloodline',
    'male/:race/:bloodline': 'maleBloodline',
    'female/:race/:bloodline': 'femaleBloodline',
    'azlist':               'alphabeticalCharacters',
    'add':                  'addCharacter',
    'characters/:id':       'characterDetails',
    'wrong-gender':         'wrongGender'
    //'feedback':             'feedback'
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
        $('#content').html('<div class="panel"></div>');
        $('.panel').html(App.Views.charactersView.render().el);
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
        if (isNaN(winLossRatio)) {
          winLossRatio = 0;
        }

        var characterSummaryView = new App.Views.CharacterSummary({ model: data, winLossRatio: winLossRatio });
        $('#content').html(characterSummaryView.render().el);
    

        characterSummaryView.selectMenuItem();
      }
    });
  }

});

var router = new App.Router();
Backbone.history.start({ pushState: true });


$(document).on("ready", function () {

  $(document).on('click', 'a:not([data-bypass])', function(e){
    var href = $(this).prop('href');
    var root = location.protocol + '//' + location.host + '/';
    if (root === href.slice(0,root.length)){
      e.preventDefault();
      Backbone.history.navigate(href.slice(root.length), true);
    }
  });

});

$(document).ajaxStart(function() {
    //only add progress bar if added yet.
    if ($("#progress").length === 0) {
        $("body").append($("<div><dt/><dd/></div>").attr("id", "progress"));
        $("#progress").width((50 + Math.random() * 30) + "%");
    }
});

$(document).ajaxComplete(function() {
    //End loading animation
    $("#progress").width("101%").delay(200).fadeOut(400, function() {
        $(this).remove();
    });
});