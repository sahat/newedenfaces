define([
  'underscore',
  'jquery',
  'backbone',
  'views/Character',
  'text!templates/menu-leaderboard.html'
], function(_, $, Backbone, CharacterView, MenuLeaderboardTpl) {

  var CharacterCollectionGenderView = Backbone.View.extend({

    tagName: 'ul',

    className: 'media-list',

    template: _.template(MenuLeaderboardTpl),

    selectMenuItem: function(menuItem) {
      $('.navbar .nav li').removeClass('active');
      if (menuItem) {
        $('.' + menuItem).addClass('active');
      }
    },

    addOne: function(character, index) {
      var characterView = new CharacterView({ model: character, position: index + 1 });
      this.$el.append(characterView.render().el);
    },

    render: function() {
      $('#content').html(this.template());
      this.collection.each(this.addOne, this);
      return this;
    }
  });

  return CharacterCollectionGenderView;
});
