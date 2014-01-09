define([
  'underscore',
  'jquery',
  'backbone',
  'views/CharacterGender',
  'text!templates/menu-leaderboard.html'
], function(_, $, Backbone, CharacterGenderView, MenuLeaderboardTpl) {

  var WrongGenderView = Backbone.View.extend({

    tagName: 'li',

    className: 'media',

    template: _.template(MenuLeaderboardTpl),

    selectMenuItem: function(menuItem) {
      $('.navbar .nav li').removeClass('active');
      if (menuItem) {
        $('.' + menuItem).addClass('active');
      }
    },

    addOne: function(character, index) {
      var characterView = new CharacterGenderView({ model: character, position: index + 1 });
      this.$el.append(characterView.render().el);
    },

    render: function() {
      $('#content').html(this.template());
      this.collection.each(this.addOne, this);
      return this;
    }
  });

  return WrongGenderView;
});
