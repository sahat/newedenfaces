define(function(require, exports, module) {
  var _ = require('underscore');
  var $ = require('jquery');
  var Backbone = require('backbone');
  var MenuLeaderboardTpl = require('text!templates/menu-leaderboard');

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
      var characterView = new App.Views.Character({ model: character, position: index + 1 });
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
