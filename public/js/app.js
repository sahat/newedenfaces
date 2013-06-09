(function() {

window.App = {
  Models: {},
  Views: {},
  Collections: {}
};

// Template helper function
window.template = function(id) {
  return _.template($('#' + id).html());
};

// Character Model
App.Models.Character = Backbone.Model.extend({

  urlRoot:"/characters",

  idAttribute: '_id'

});

// Characters Collection
App.Collections.Characters = Backbone.Collection.extend({

  model: App.Models.Character,

  url: '/characters'

});


// Home View
App.Views.Home = Backbone.View.extend({

  tagName: 'ul',

  className: 'thumbnails',

  template: template('home-template'),

  initialize: function() {
    this.collection.on('change:wins', this.updateLosses, this);
  },

  updateLosses: function(winnerModel) {
    var winnerIndex = this.collection.indexOf(winnerModel);
    var otherModel = this.collection.at(Math.abs(1 - winnerIndex));
    otherModel.set('losses', otherModel.get('losses') + 1);
    this.eloRating(winnerIndex);
    otherModel.save();
    this.render();
  },



  eloRating: function(winnerIndex) {

    var kFactor = 16;

    if (winnerIndex == 0) {
      // A won
      var ratingA = this.collection.at(0).get('rating');
      var ratingB = this.collection.at(1).get('rating');
  
      var scoreA = this.collection.at(0).get('wins');
      var scoreB = this.collection.at(1).get('wins');

      var expectedA = 1.0 / (1.0 + Math.pow(10, ((ratingA - ratingB) / 400)));
      var expectedB = 1.0 / (1.0 + Math.pow(10, ((ratingA - ratingB) / 400)));

      var newRatingA = ratingA + (kFactor * expectedA);
      var newRatingB = ratingB - (kFactor * expectedA);

      this.collection.at(0).set('rating', Math.round(newRatingA));
      this.collection.at(1).set('rating', Math.round(newRatingB));
    } else {
      // B won
      var ratingA = this.collection.at(0).get('rating');
      var ratingB = this.collection.at(1).get('rating');
    
      var scoreA = this.collection.at(0).get('wins');
      var scoreB = this.collection.at(1).get('wins');

      var expectedA = 1.0 / (1.0 + Math.pow(10, ((ratingB - ratingA) / 400)));
      var expectedB = 1.0 / (1.0 + Math.pow(10, ((ratingB - ratingA) / 400)));

      var newRatingA = ratingA - (kFactor * expectedA);
      var newRatingB = ratingB + (kFactor * expectedA);

      this.collection.at(0).set('rating', Math.round(newRatingA));
      this.collection.at(1).set('rating', Math.round(newRatingB));
    }
    
  },

  render: function() {
    this.$el.html(this.template());
    this.collection.reset(this.collection.shuffle(), { silent: true });
    var twoChars = new Backbone.Collection(this.collection.slice(0,2));
    twoChars.each(this.addOne, this);
    // re-instantiate tooltip per each new entries
    this.$('.lead').tooltip({ placement: 'bottom' });
    return this;
  },

  addOne: function(character, index) {
    var characterThumbnailView = new App.Views.CharacterThumbnail({ model: character });
    
    // add bootstrap offset3 to the first thumbnail
    if (index == 0) {
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

  template: template('character-thumbnail-template'),

  initialize: function() {
    this.model.on('change', this.render, this);
  },

  events: {
    'click img': 'winner'
  },

  winner: function() {
    this.model.set('wins', this.model.get('wins') + 1);
    this.model.save();
  },

  render: function () {
    this.$el.html(this.template(this.model.toJSON()));
    var wins = this.model.get('wins');
    var losses = this.model.get('losses');

    // catch for division by zero (new players)
    if (isNaN(wins / (wins + losses))) {
      this.$el.find('.bar').width('0%');
      this.$el.find('span').html('0%').css('color','#111');
    } else {
      var winningPercentage = Math.round(100 * (wins / (wins + losses)));
      this.$el.find('.bar').width(winningPercentage + '%');
      this.$el.find('span').html(winningPercentage + '%');
    }
    return this;
  }

});


App.Views.Feedback = Backbone.View.extend({

  template: template('feedback-template'),

  events: {
    'submit': 'submit'
  },

  submit: function(e) {
    e.preventDefault();

    var newCharacter = new App.Models.Character({
      name: this.$('input[name=addcharacter]').val()
    });

    var characterName = this.$el.find('input[name=characterName]');
    var characterNameHelpBlock = this.$el.find('#characterNameHelpBlock');

    var userInterfaceRadios = $('form input[type=radio]:checked');
    var userInterfaceHelpBlock = this.$el.find('#userInterfaceHelpBlock');


    var characterNameCG = this.$el.find('#characterNameCG');
    var userInterfaceCG = this.$el.find('#userInterfaceCG');
    var messageCG = this.$el.find('#messageCG');

    var message = $('textarea').val();
   
    var submitBtn = this.$el.find('button');

    // validation error occured, find out which one
    if (!characterName.val() || !userInterfaceRadios.length) {     
      if (!characterName.val()) {
      characterNameCG.addClass('error');
      characterNameHelpBlock.text('This field cannot be blank');
      characterName.focus();
    }
      if (!userInterfaceRadios.length) {
        userInterfaceCG.addClass('error');
        userInterfaceHelpBlock.text('Please select one of the choices');
      }
    } else {
      submitBtn.button('loading');
      // no validation errors, send data to the server
      postData = {
        characterName: characterName.val(),
        uiRating: userInterfaceRadios.val(),
        message: message
      };

      $.post('/feedback', postData ,function(data) {
        submitBtn.button('reset');
        localStorage.feedbackSent = true;
        localStorage.feedbackNotice = '<div class="alert alert-success"><strong>Success!</strong> Thank you for the feedback.</div>';
        $('#content').html(localStorage.feedbackNotice);
      });
    }
  },

  render: function() {
    this.$el.html(this.template());
    return this;
  },

  selectMenuItem: function(menuItem) {
    $('.navbar .nav li').removeClass('active');
    if (menuItem) {
      $('.' + menuItem).addClass('active');
    }
  }

});


// Footer leaderboard view on home page
App.Views.Leaderboard = Backbone.View.extend({

  tagName: 'ul',

  className: 'inline',

  render: function() {

    this.collection.comparator = function(characterA, characterB) {
      if (characterA.get('rating') > characterB.get('rating')) return -1;
      if (characterB.get('rating') > characterA.get('rating')) return 1;
      return 0;
    },

    this.collection.sort({ silent: true });

    var top14 = new Backbone.Collection(this.collection.slice(0,14));
    
    delete this.collection.comparator;

    top14.each(function(character) {
      var leaderboardItemView = new App.Views.LeaderboardItem({ model: character });
      this.$el.append(leaderboardItemView.render().el);
    }, this);
    
    return this;
  }

});

// individual leaderboard item
App.Views.LeaderboardItem = Backbone.View.extend({

  tagName: 'li',

  template: template('leaderboard-item-template'),

  render: function () {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }

});


// Character View
App.Views.Character = Backbone.View.extend({

  tagName: 'li',

  className: 'media',

  template: template('character-template'),

  render: function () {
    var data = {
      model: this.model.toJSON(),
      position: this.options.position
    }

    this.$el.html(this.template(data));
    return this;
  }

});

// Characters Collection View
App.Views.Characters = Backbone.View.extend({

  tagName: 'ul',

  className: 'media-list',

  template: template('menu-leaderboard-template'),

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

    this.collection.comparator = function(characterA, characterB) {
      if (characterA.get('rating') > characterB.get('rating')) return -1;
      if (characterB.get('rating') > characterA.get('rating')) return 1;
      return 0;
    },

    this.collection.sort({ silent: true });

    var top100 = new Backbone.Collection(this.collection.slice(0,100));
    
    delete this.collection.comparator;

    $('#content').html(this.template());
    top100.each(this.addOne, this);
    return this;
  }

});

// Character Summary View
App.Views.CharacterSummary = Backbone.View.extend({

  template: template('character-summary-template'),

  selectMenuItem: function(menuItem) {
    $('.navbar .nav li').removeClass('active');
    if (menuItem) {
      $('.' + menuItem).addClass('active');
    }
  },

  render: function () {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }

});


// Search View
App.Views.Search = Backbone.View.extend({
  
  el: $('.navbar'),

  events: {
    'submit form': 'submit'
  },

  submit: function(e) {
    e.preventDefault();

    var input = this.$el.find('input').val();

    var match = this.collection.where({ name: input });

    if (match) {
      Backbone.history.navigate('#characters/' + input, { trigger: true });
    } else {
      console.log('no match, got: ' + input);
    }
  }

});

// Add Character View
App.Views.AddCharacter = Backbone.View.extend({

  template: template('add-character-template'),

  events: {
    "submit form":"submit"
  },

  render:function () {
    this.$el.html(this.template());
    return this;
  },

  submit: function(e) {
    e.preventDefault();

    var newCharacter = new App.Models.Character({
      name: this.$('input[name=addcharacter]').val()
    });
    
    var helpBlock = this.$el.find('.help-block');
    var controlGroup = this.$el.find('.control-group');
    var inputField = this.$el.find('input');
    var submitBtn = this.$el.find('button');

    submitBtn.button('loading');

    newCharacter.save(null, {
      success: function() {
        Backbone.history.navigate('#', { trigger: true });
      },
      error: function(model, response) {
        controlGroup.addClass('error');
        submitBtn.removeClass('btn-primary').addClass('btn-danger');
        submitBtn.button('reset');
        inputField.focus();

        if (response.status == 409) {
            helpBlock.html('<a href="#characters/' + inputField.val() + '">' + inputField.val() + '</a> is already in our system.');
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
    
    var characters = new App.Collections.Characters();
    characters.fetch({
      success: function(data) {

        var searchView = new App.Views.Search({
          collection: characters
        });
      }
    });
  },

  routes: {
    '':                   'home',
    'top100':             'topCharacters',
    'add':                'addCharacter',
    'characters/:name':   'characterDetails',
    'feedback':           'feedback'
  },

  home: function() {
    var characters = new App.Collections.Characters();
    characters.fetch({
      success: function(data) {

        var homeView = new App.Views.Home({
          collection: characters
        });

        var leaderboardView = new App.Views.Leaderboard({
          collection: characters
        });

        $('#content').html(homeView.render().el);
        $('.footer #leaderboard').html(leaderboardView.render().el);
        homeView.selectMenuItem('home-menu');
      }
    });
  },

  feedback: function() {
    if (localStorage.feedbackSent) {
      $('#content').html(localStorage.feedbackNotice);
    } else {
      var feedbackView = new App.Views.Feedback();
      $('#content').html(feedbackView.render().el);
      feedbackView.selectMenuItem('home-menu');
    }
  },

  topCharacters: function() {
    var characters = new App.Collections.Characters();

    characters.fetch({
      success: function(data) {

        var charactersView = new App.Views.Characters({
          collection: characters
        });

        $('#content').append(charactersView.render().el);

        charactersView.selectMenuItem('top100-menu');
      }
    });
  },

  addCharacter: function() {
    var addCharacterView = new App.Views.AddCharacter();
    addCharacterView.selectMenuItem('add-menu');
    $('#content').html(addCharacterView.render().el);
  },

  characterDetails: function (name) {
    var character = new App.Models.Character({ _id: name });
    character.fetch({
      error: function(err) {
        console.log(err, 'error');
      },
      success: function(data) {
        var characterSummaryView = new App.Views.CharacterSummary({ model: data });
        $('#content').html(characterSummaryView.render().el);
        characterSummaryView.selectMenuItem();
      }
    });
  }

});

var router = new App.Router();
Backbone.history.start();

})();

$(document).on("ready", function () {


    // App.loadTemplates(["HomeView", "AddCharacterView", "TopCharactersView", "ContactView", "NavBarView", "CharacterView", "CharacterListItemView"],
    //   function () {
    //       App.router = new App.Router();
    //       Backbone.history.start();

    //   });

    // $(document).on('click', 'a:not([data-bypass])', function(e){
    //   href = $(this).prop('href')
    //   root = location.protocol+'//'+location.host+'/'
    //   if (root===href.slice(0,root.length)){
    //     e.preventDefault();
    //     Backbone.history.navigate(href.slice(root.length), true);
    //   }
    // });


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