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

  urlRoot:"http://localhost:3000/characters",

  idAttribute: '_id'

});

// Characters Collection
App.Collections.Characters = Backbone.Collection.extend({

    model: App.Models.Character,

    url: 'http://localhost:3000/characters'

});


// Characters Collection View
App.Views.Characters = Backbone.View.extend({

  tagName: 'table',

  className: 'table table-striped',

  template: template('characters-template'),

  render: function() {
    // render an empty table
    this.$el.html(this.template());
    // build a <tbody> with rows of characters
    this.collection.each(this.addOne, this);
    return this;
  },

  selectMenuItem: function(menuItem) {
    $('.navbar .nav li').removeClass('active');
    if (menuItem) {
      $('.' + menuItem).addClass('active');
    }
  },

  addOne: function(character, index) {
    // create new character view
    var characterView = new App.Views.Character({ model: character });
    // apend to <tbody>
    this.$el.append(characterView.render().el);
  }

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
    return this;
  },

  addOne: function(character, index) {
    var characterThumbnailView = new App.Views.CharacterThumbnail({ model: character });
    
    // add bootstrap offset3 to the first thumbnail
    if (index == 0) {
      characterThumbnailView.$el.addClass('offset3');
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

  className: 'span3',

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
    return this;
  }

});


// Character View
App.Views.Character = Backbone.View.extend({

  tagName: 'tr',

  template: template('character-template'),

  events: {
    'click button': 'showAlert'
  },

  showAlert: function() {
    alert('you clicked on ' + this.model.get('name'));
  },

  render: function () {
    this.$el.html(this.template(this.model.toJSON()));
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
    console.log(this.model.attributes)
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }

});


// Add Character View
App.Views.AddCharacter = Backbone.View.extend({

  template: template('add-character-template'),

  events:{
    "submit form":"submit"
  },

  render:function () {
    this.$el.html(this.template());
    return this;
  },

  submit: function(e) {
    e.preventDefault();
    console.log("clicked on add character button");
    
    var newCharacter = new App.Models.Character({
      name: this.$('input[name=addcharacter]').val()
    });

    newCharacter.save(null, {success: function() {
      Backbone.history.navigate('#', { trigger: true });
    }});
  },

  selectMenuItem: function(menuItem) {
    $('.navbar .nav li').removeClass('active');
    if (menuItem) {
      $('.' + menuItem).addClass('active');
    }
  }

});

App.Router = Backbone.Router.extend({

  routes: {
    '':                 'home',
    'top10':            'topCharacters',
    'add':              'addCharacter',
    'characters/:name': 'characterDetails'
  },

  home: function () {
    var characters = new App.Collections.Characters();
    characters.fetch({
      success: function(data) {

        var homeView = new App.Views.Home({
          collection: characters
        });

        $('#content').html(homeView.render().el);

        homeView.selectMenuItem('home-menu');
      }
    });
  },

  topCharacters: function() {
    var characters = new App.Collections.Characters();
    characters.fetch({
      success: function(data) {

        var charactersView = new App.Views.Characters({
          collection: characters
        });

        $('#content').html(charactersView.render().el);

        charactersView.selectMenuItem('top10-menu');
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
