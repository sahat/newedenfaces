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

  url: '/api/characters',

  parse: function(response) {
    this.nonce = response.nonce;
    return response.characters;
  }

});


// Home View (Main view)
App.Views.Home = Backbone.View.extend({

  tagName: 'ul',

  className: 'thumbnails',

  template: template('home-template'),

  initialize: function() {
    this.collection.on('change:wins', this.updateCount, this);
  },

  updateCount: function(winningModel) {
    var losingModel = this.collection.at(Math.abs(1 - this.collection.indexOf(winningModel)));
    losingModel.set('losses', losingModel.get('losses') + 1);
    var self = this;
    $.ajax({
      url: '/api/vote',
      type: 'PUT',
      data: { 
        winner: winningModel.get('characterId'),
        loser: losingModel.get('characterId'),
      },
      success: function() {
        self.collection.fetch({
          url: '/api/characters',
          success: function() {
            self.render();
          }
        });
      }
    });
  },

  render: function() {
    this.$el.html(this.template());
    this.collection.each(this.addOne, this);
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

  winner: function() {
    this.model.set('wins', this.model.get('wins') + 1);
  },

  render: function () {
    this.$el.html(this.template(this.model.toJSON()));
    this.$el.find('img').on('dragstart', function(e) {
      e.preventDefault();
    });
    return this;
  }

});


// App.Views.Feedback = Backbone.View.extend({

//   template: template('feedback-template'),

//   events: {
//     'submit': 'submit'
//   },

//   submit: function(e) {
//     e.preventDefault();

//     var newCharacter = new App.Models.Character({
//       name: this.$('input[name=addcharacter]').val()
//     });

//     var characterName = this.$el.find('input[name=characterName]');
//     var characterNameHelpBlock = this.$el.find('#characterNameHelpBlock');

//     var userInterfaceRadios = $('form input[type=radio]:checked');
//     var userInterfaceHelpBlock = this.$el.find('#userInterfaceHelpBlock');


//     var characterNameCG = this.$el.find('#characterNameCG');
//     var userInterfaceCG = this.$el.find('#userInterfaceCG');
//     var messageCG = this.$el.find('#messageCG');

//     var message = $('textarea').val();
   
//     var submitBtn = this.$el.find('button');

//     // validation error occured, find out which one
//     if (!characterName.val() || !userInterfaceRadios.length) {     
//       if (!characterName.val()) {
//       characterNameCG.addClass('error');
//       characterNameHelpBlock.text('This field cannot be blank');
//       characterName.focus();
//     }
//       if (!userInterfaceRadios.length) {
//         userInterfaceCG.addClass('error');
//         userInterfaceHelpBlock.text('Please select one of the choices');
//       }
//     } else {
//       submitBtn.button('loading');
//       // no validation errors, send data to the server
//       postData = {
//         characterName: characterName.val(),
//         uiRating: userInterfaceRadios.val(),
//         message: message
//       };

//       $.post('/api/feedback', postData ,function(data) {
//         submitBtn.button('reset');
//         localStorage.feedbackSent = true;
//         localStorage.feedbackNotice = '<div class="alert alert-success"><strong>Success!</strong> Thank you for the feedback.</div>';
//         $('#content').html(localStorage.feedbackNotice);
//       });
//     }
//   },

//   render: function() {
//     this.$el.html(this.template());
//     return this;
//   },

//   selectMenuItem: function(menuItem) {
//     $('.navbar .nav li').removeClass('active');
//     if (menuItem) {
//       $('.' + menuItem).addClass('active');
//     }
//   }

// });


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
    // this.collection.comparator = function(character) {
    //   return -character.get('wins');
    // };

    // this.collection.sort();

    //console.log(this.collection.toJSON())

    // this.collection = this.collection.sortBy(function(model) {
    //   // var winningPercentage = model.get('wins') / (model.get('wins') + model.get('losses'));
    //   // return winningPercentage;
    //   return -model.get('wins');
    // });

    // var top14 = new Backbone.Collection(this.collection);
    
    // delete this.collection.comparator;

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

    // this.collection.comparator = function(characterA, characterB) {
    //   if (characterA.get('rating') > characterB.get('rating')) return -1;
    //   if (characterB.get('rating') > characterA.get('rating')) return 1;
    //   return 0;
    // },

    // // this.collection.sort({ silent: true });

    // this.collection = this.collection.sortBy(function(model) {
    //   // var winningPercentage = model.get('wins') / (model.get('wins') + model.get('losses'));
    //   // return -winningPercentage;
    //   return -model.get('wins');
    // });

    // var top100 = new Backbone.Collection(this.collection);
    
    //delete this.collection.comparator;
    //console.log('not caching top100');
    $('#content').html(this.template());
    this.collection.each(this.addOne, this);
    return this;
  }

});

// Character Summary View
App.Views.CharacterSummary = Backbone.View.extend({

  template: template('character-summary-template'),

  initialize: function() {
    //this.model.on('change:userRatingVotes', this.updateAverage, this);
  },

  events: {
    //'submit form': 'submit',
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

  // updateAverage: function() {
  //   this.options.averageRating = this.model.get('userRating') / this.model.get('userRatingVotes');
  //   this.$el.find('#averageRating').text(this.options.averageRating.toFixed(2));
  //   this.$el.find('#voteCount').text(this.model.get('userRatingVotes'));
  // },

  // submit: function(e) {
  //   e.preventDefault();

  //   var input = this.$el.find('input');
  //   var controlGroup = this.$el.find('.control-group');
  //   var helpBlock = this.$el.find('.help-block');
  //   if (isNaN(input.val())) {
  //     helpBlock.text('Please enter a valid number.');
  //     controlGroup.addClass('error');
  //     input.val();
  //     input.focus();
  //   } else if (parseInt(input.val()) < 0) {
  //     helpBlock.text('Rating cannot be less than 0.');
  //     controlGroup.addClass('error');
  //     input.val();
  //     input.focus();
  //   } else if (parseInt(input.val()) > 10) {
  //     helpBlock.text('Rating cannot be greater than 10.');
  //     controlGroup.addClass('error');
  //     input.val();
  //     input.focus();
  //   } else {
  //     helpBlock.text('');
  //     controlGroup.removeClass('error');

  //     this.model.set('userRating', this.model.get('userRating') + parseFloat(input.val()));
  //     this.model.set('userRatingVotes', this.model.get('userRatingVotes') + 1);
  //     this.model.save();

  //     // TODO refactor into a function
  //     input.val("You've already voted!");
  //     input.prop('disabled', true);
  //     this.$el.find('#rateButton').prop('disabled', true);
  //     localStorage[this.model.get('characterId')] = 'True';
  //   }
  // },

  

  render: function () {


    var data = {
      model: this.model.toJSON(),
      WLRatio: this.options.winLossRatio
    };

    this.$el.html(this.template(data));

    // Must be after we render content, or else it won't find the DOM elements
    // if (localStorage[this.model.get('characterId')] == 'True') {
    //   //console.log('true story')
    //   var input = this.$el.find('input');
    //   //console.log(input);
    //   input.val("You've already voted!");
    //   input.prop('disabled', true);
    //   this.$el.find('#rateButton').prop('disabled', true);
    // }

    if (localStorage['reported-'+this.model.get('characterId')] == 'True') {
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
        toastr.success('Character has been added successfully');
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
    'top/:race':            'topRace',
    'top/:race/:bloodline': 'topBloodline',
    'azlist':               'alphabeticalCharacters',
    'add':                  'addCharacter',
    'characters/:id':       'characterDetails'
    //'feedback':             'feedback'
  },

  home: function() {
    var characters = new App.Collections.Characters();
    characters.fetch({
      success: function(data) {
        
        App.Views.homeView = new App.Views.Home({
          collection: data,
          nonce: data.nonce
        });
        
        $('#content').html(App.Views.homeView.render().el);
        App.Views.homeView.selectMenuItem('home-menu');
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
        $('#content').html(App.Views.charactersView.render().el);
        App.Views.charactersView.selectMenuItem('hall-of-shame-menu');
      }
    });
  },

  topRace: function(race) {
    var characters = new App.Collections.Characters();
    characters.fetch({
      url: '/api/characters/top/' + race,
      success: function(data) {
        App.Views.charactersView = new App.Views.Characters({
          collection: characters
        });
        $('#content').html(App.Views.charactersView.render().el);
        App.Views.charactersView.selectMenuItem('top-menu');
      }
    });
  },


  topBloodline: function(race, bloodline) {
    var characters = new App.Collections.Characters();
    characters.fetch({
      url: '/api/characters/top/' + race + '/' + bloodline,
      success: function(data) {
        App.Views.charactersView = new App.Views.Characters({
          collection: characters
        });
        $('#content').html(App.Views.charactersView.render().el);
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
        $('#content').html(App.Views.charactersView.render().el);
        App.Views.charactersView.selectMenuItem('top-menu');
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
        //var averageRating = data.get('userRating') / data.get('userRatingVotes');
        //if (isNaN(averageRating)) averageRating = 0;

        var winLossRatio = (data.get('wins') / (data.get('wins') + data.get('losses')) * 100).toFixed(1);
        if (isNaN(winLossRatio)) winLossRatio = 0;

        var characterSummaryView = new App.Views.CharacterSummary({ model: data, winLossRatio: winLossRatio });
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