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

  urlRoot:"http://localhost:3000/characters"

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

  addOne: function(character) {
    // create new character view
    var characterView = new App.Views.Character({ model: character });
    // apend to <tbody>
    this.$el.append(characterView.render().el);
  }

});


// Home View
App.Views.Home = Backbone.View.extend({

  template: template('home-template'),

  selectMenuItem: function(menuItem) {
    $('.navbar .nav li').removeClass('active');
    if (menuItem) {
      $('.' + menuItem).addClass('active');
    }
  },

  render: function() {
    this.$el.html(this.template());
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
    console.log(this.$('input[name=addcharacter]').val());
    Backbone.history.navigate('#', true);
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
    var homeView = new App.Views.Home();
    homeView.selectMenuItem('home-menu');
    $('#content').html(homeView.render().el);
  },

  topCharacters: function() {
    var characters = new App.Collections.Characters();
    var self = this;
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
    var character = new App.Models.Character({ id: name });
    character.fetch({
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
