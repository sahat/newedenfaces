define(function(require, exports, module) {
  var _ = require('underscore');
  var $ = require('jquery');
  var Backbone = require('backbone');
  var CharacterThumbnailTpl = require('text!templates/character-thumbnail');

  var CharacterThumbnailView = Backbone.View.extend({
    tagName: 'li',

    className: 'span6',

    template: _.template(CharacterThumbnailTpl),

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

  return CharacterThumbnailView;
});
