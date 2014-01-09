define([
  'underscore',
  'jquery',
  'backbone',
  'text!templates/stats.html'
], function(_, $, Backbone, StatsTpl) {

  var StatsView = Backbone.View.extend({

    template: _.template(StatsTpl),

    initialize: function(options) {
      this.options = options || {};
    },

    render:function () {
      this.$el.html(this.template(this.options.stats));

      return this;
    },

    selectMenuItem: function(menuItem) {
      $('.navbar .nav li').removeClass('active');
      if (menuItem) {
        $('.' + menuItem).addClass('active');
      }
    }
  });

  return StatsView;
});
