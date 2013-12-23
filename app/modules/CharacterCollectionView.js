define(function(require, exports, module) {
  var _ = require('underscore');
  var $ = require('jquery');
  var Backbone = require('backbone');
  var CharacterView = require('modules/CharacterView');
  var MenuLeaderboardTpl = require('text!templates/menu-leaderboard');

  var CharacterCollectionView = Backbone.View.extend({
    tagName: 'ul',

    className: 'list-group list-group-flush m-t-n',

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
      this.collection.each(this.addOne, this);
      return this;
    }
  });

  return CharacterCollectionView;
});
