define(function(require, exports, module) {
  var _ = require('underscore');
  var $ = require('jquery');
  var Backbone = require('backbone');
  var Chart = require('chart');
  var StatsTpl = require('text!templates/stats.html')

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
