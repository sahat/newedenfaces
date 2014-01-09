define([
  'underscore',
  'jquery',
  'backbone',
  'text!templates/character-thumbnail.html'
], function(_, $, Backbone, CharacterThumbnailTpl) {

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
