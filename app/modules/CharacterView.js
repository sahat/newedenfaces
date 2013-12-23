define(function(require, exports, module) {
  var _ = require('underscore');
  var $ = require('jquery');
  var Backbone = require('backbone');
  var CharacterTpl = require('text!templates/character');

  var CharacterView = Backbone.View.extend({
    tagName: 'li',

    className: 'list-group-item',

    template: _.template(CharacterTpl),

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
