define([
  'underscore',
  'jquery',
  'backbone',
  'text!templates/character.html'
], function(_, $, Backbone, CharacterTpl) {

  var CharacterView = Backbone.View.extend({

    tagName: 'li',

    className: 'list-group-item',

    template: _.template(CharacterTpl),

    initialize: function(options) {
      this.options = options || {};
    },

    events: {
      'click #male': 'male',
      'click #delete': 'delete'
    },

    render: function () {
      this.$el.html(this.template({
        model: this.model.toJSON(),
        position: this.options.position
      }));
      return this;
    }
  });

  return CharacterView;
});
