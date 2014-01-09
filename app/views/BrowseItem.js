define([
  'underscore',
  'jquery',
  'backbone',
  'text!templates/browse-item.html'
], function(_, $, Backbone, BrowseItemTpl) {

  var BrowseItemView = Backbone.View.extend({

    template: _.template(BrowseItemTpl),

    initialize: function(options) {
      this.options = options || {};
    },

    render: function () {
      this.$el.html(this.template({ characters: this.collection }));
      return this;
    }
  });

  return BrowseItemView;
});
