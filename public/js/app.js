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

  urlRoot:"/api/characters",

  idAttribute: 'characterId'

});

// Characters Collection
App.Collections.Characters = Backbone.Collection.extend({

  model: App.Models.Character,

  url: '/api/characters'

});


// Home View (Main view)
App.Views.Home = Backbone.View.extend({

  tagName: 'ul',

  className: 'thumbnails',

  template: template('home-template'),

  events: {
    'click #skip': 'skip'
  },

  initialize: function() {
    _.bindAll(this);
    Mousetrap.bind('s', this.skip);
    this.collection.on('change:wins', this.updateCount, this);
  },

  skip: function() {
    console.log('skipping...')
    var self = this;
    
    this.collection.fetch({
      url: '/api/characters',
      success: function(data) {
        self.render();
        if (data.length < 2) {
          Mousetrap.unbind(['s', 'left', 'right', 'a', 'd']);
          $('#content').html('<div class="alert alert-info"><strong>Congratulations!</strong><br>You have exhausted all characters. Refresh the page to start over.</div>')
        }
      }
    });
  },

  updateCount: function(winningModel) {
    var losingModel = this.collection.at(Math.abs(1 - this.collection.indexOf(winningModel)));
    console.log('update count')
    $.ajax({
      url: '/api/loser/' + losingModel.get('characterId'),
      type: 'PUT',
      success: function(data) {
        losingModel.set('losses', losingModel.get('losses') + 1);
      }
    });

    var self = this;
    
    this.collection.fetch({
      url: '/api/characters',
      success: function(data) {
        self.render();
        if (data.length < 2) {
          Mousetrap.unbind(['s', 'left', 'right', 'a', 'd']);
          $('#content').html('<div class="alert alert-info"><strong>Congratulations!</strong><br>You have exhausted all characters. Refresh the page to start over.</div>')
        }
      }
    });
  },

  render: function() {
    this.$el.html(this.template());
    // var sortedByVotes = this.collection.sortBy(function(m) {
    //   var wins = m.get('wins');
    //   var losses = m.get('losses');
    //   var total = wins + losses;
    //   return total;
    // });
    // sortedByVotes = new Backbone.Collection(sortedByVotes);
    this.collection.each(this.addOne, this);
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

  events: {
    'click img': 'winner',
  },

  initialize: function() {
    _.bindAll(this);
    Mousetrap.bind('left', this.winner);
    Mousetrap.bind('right', this.winner);
    Mousetrap.bind('a', this.winner);
    Mousetrap.bind('d', this.winner);
  },

  winner: function() {
    var self = this;
    $.ajax({
      url: '/api/winner/' + this.model.get('characterId'),
      type: 'PUT',
      success: function(data) {
        self.model.set('wins', self.model.get('wins') + 1);
      }
    });
  },


  render: function () {
    this.$el.html(this.template(this.model.toJSON()));
    this.$el.find('img').on('dragstart', function(e) {
      e.preventDefault();
    });
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

      $.post('/api/feedback', postData ,function(data) {
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

    // this.collection.comparator = function(characterA, characterB) {
    //   winLossCharacterA = characterA.get('wins') / (characterA.get('wins') + characterA.get('losses')); 
    //   winLossCharacterB = characterB.get('wins') / (characterB.get('wins') + characterB.get('losses')); 
    //   console.log('win-loss-a', winLossCharacterA);
    //   console.log('win-loss-b', winLossCharacterB);
    //   if (winLossCharacterA > winLossCharacterB) return -1;
    //   if (winLossCharacterB > winLossCharacterA) return 1;
    //   return 0;
    // },

    this.collection = this.collection.sortBy(function(model) {
      //return -(model.get('wins') / (model.get('wins') + model.get('losses') ));
      return -model.get('wins');
    });

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
    this.$el.html(characterView.render().el);
  },

  render: function() {

    // this.collection.comparator = function(characterA, characterB) {
    //   if (characterA.get('rating') > characterB.get('rating')) return -1;
    //   if (characterB.get('rating') > characterA.get('rating')) return 1;
    //   return 0;
    // },

    // this.collection.sort({ silent: true });

    // this.collection = this.collection.sortBy(function(model) {
    //   //return -(model.get('wins') / (model.get('wins') + model.get('losses') ));
    //   return -model.get('wins');
    // });

    // var top100 = new Backbone.Collection(this.collection.slice(0,100));
    
    //delete this.collection.comparator;

    $('#content').html(this.template());
    this.collection.each(this.addOne, this);
    return this;
  }

});

// Character Summary View
App.Views.CharacterSummary = Backbone.View.extend({

  template: template('character-summary-template'),

  initialize: function() {
    this.model.on('change:userRatingVotes', this.updateAverage, this);
  },

  events: {
    'submit form': 'submit',
    'click #report': 'reportPlayer',
    'click #update': 'updateAvatar'
  },

  updateAvatar: function() {
    $.ajax({
      type: 'PUT',
      url: '/api/grid/' + this.model.get('characterId'),
      success: function() {
        toastr.success('Avatar has been updated successfully. Please reload the page.');
      }
    });
  },

  reportPlayer: function(e) {
    var self = this;
    console.log(localStorage['reported-'+this.model.get('characterId')])

    $.post('/api/report', this.model.toJSON(), function(data) {
      self.$el.find('#report').attr('disabled', true);
      localStorage['reported-' + self.model.get('characterId')] = 'True';
    });
  },

  updateAverage: function() {
    this.options.averageRating = this.model.get('userRating') / this.model.get('userRatingVotes');
    this.$el.find('#averageRating').text(this.options.averageRating.toFixed(2));
    this.$el.find('#voteCount').text(this.model.get('userRatingVotes'));
  },

  submit: function(e) {
    e.preventDefault();

    var input = this.$el.find('input');
    var controlGroup = this.$el.find('.control-group');
    var helpBlock = this.$el.find('.help-block');
    if (isNaN(input.val())) {
      helpBlock.text('Please enter a valid number.');
      controlGroup.addClass('error');
      input.val();
      input.focus();
    } else if (parseInt(input.val()) < 0) {
      helpBlock.text('Rating cannot be less than 0.');
      controlGroup.addClass('error');
      input.val();
      input.focus();
    } else if (parseInt(input.val()) > 10) {
      helpBlock.text('Rating cannot be greater than 10.');
      controlGroup.addClass('error');
      input.val();
      input.focus();
    } else {
      helpBlock.text('');
      controlGroup.removeClass('error');

      this.model.set('userRating', this.model.get('userRating') + parseFloat(input.val()));
      this.model.set('userRatingVotes', this.model.get('userRatingVotes') + 1);
      this.model.save();

      // TODO refactor into a function
      input.val("You've already voted!");
      input.prop('disabled', true);
      this.$el.find('#rateButton').prop('disabled', true);
      localStorage[this.model.get('characterId')] = 'True';
    }
  },

  

  render: function () {


    var data = {
      model: this.model.toJSON(),
      averageRating: this.options.averageRating,
      WLRatio: this.options.winLossRatio
    }

    this.$el.html(this.template(data));

    // Must be after we render content, or else it won't find the DOM elements
    if (localStorage[this.model.get('characterId')] == 'True') {
      console.log('true story')
      var input = this.$el.find('input');
      console.log(input);
      input.val("You've already voted!");
      input.prop('disabled', true);
      this.$el.find('#rateButton').prop('disabled', true);
    }

    if (localStorage['reported-'+this.model.get('characterId')] == 'True') {
      console.log('already reported');
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
      return;
    }

    var characterId = queryMatch[0].get('characterId');

    if (characterId) {
      Backbone.history.navigate('/characters/' + characterId, { trigger: true });
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

    var helpBlock = this.$el.find('.help-block');
    var controlGroup = this.$el.find('.control-group');
    var inputField = this.$el.find('input');
    var submitBtn = this.$el.find('button');

    var newCharacter = new App.Models.Character({
      name: inputField.val()
    });

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

        // I've made so that the server returns a character id object with 409 error
        // we need character id to create a url linkback to that existing character
        var characterId = response.responseJSON.characterId;

        if (response.status == 409) {
            helpBlock.html('<a href="/characters/' + characterId + '">' + model.get('name') + '</a> is already in our system.');
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
    'top':                'topCharacters',
    'azlist':             'alphabeticalCharacters',
    'add':                'addCharacter',
    'characters/:id':     'characterDetails',
    'feedback':           'feedback'
  },

  home: function() {
    var characters = new App.Collections.Characters();
    
    // initialize view here
    // pass in dummy empty collection
    // var homeView = new App.Views.Home({
    //   collection: new Backbone.Collection()
    // });
    // 
    
    if (App.Views.homeView) {
      console.log('reusing homeview');
      $('#content').html(App.Views.homeView.render().el);
      App.Views.homeView.selectMenuItem('home-menu');
    } else {
      console.log('not reusing home');
      characters.fetch({
        success: function(data) {

          //reset collection here
          App.Views.homeView = new App.Views.Home({
            collection: new Backbone.Collection(data.shuffle())
          });


          App.Views.leaderboardView = new App.Views.Leaderboard({
            collection: characters
          });

          $('#content').html(App.Views.homeView.render().el);
          $('.footer #leaderboard').html(App.Views.leaderboardView.render().el);
          App.Views.homeView.selectMenuItem('home-menu');
        }
      });
    }

    
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

    if (App.Views.charactersView) {
      console.log('reusing top100 view');

      $('#content').html(App.Views.charactersView.render().el);
      
      App.Views.charactersView.selectMenuItem('top-menu');
    } else {
      console.log('not reusing top100 view');
      characters.fetch({
        url: '/api/characters/top',
        success: function(data) {
          App.Views.charactersView = new App.Views.Characters({
            collection: characters
          });
          $('#content').html(App.Views.charactersView.render().el);
          App.Views.charactersView.selectMenuItem('top-menu');
        }
      });
    }
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
        var averageRating = data.get('userRating') / data.get('userRatingVotes');
        if (isNaN(averageRating)) averageRating = 0;

        var winLossRatio = Math.floor(data.get('wins') / (data.get('wins') + data.get('losses')) * 100);
        if (isNaN(winLossRatio)) winLossRatio = 0;

        var characterSummaryView = new App.Views.CharacterSummary({ model: data, averageRating: averageRating.toFixed(2), winLossRatio: winLossRatio });
        $('#content').html(characterSummaryView.render().el);
    

        characterSummaryView.selectMenuItem();
      }
    });
  }

});

var router = new App.Router();
Backbone.history.start({ pushState: true });

})();

$(document).on("ready", function () {
  $(document).on('click', 'a:not([data-bypass])', function(e){
    href = $(this).prop('href')
    root = location.protocol+'//'+location.host+'/'
    if (root===href.slice(0,root.length)){
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