define(function(require, exports, module) {
  var _ = require('underscore');
  var $ = require('jquery');
  var Backbone = require('backbone');
  var Chart = require('chart');
  var StatsTpl = require('text!templates/stats.html')

  var StatsView = Backbone.View.extend({
    template: _.template(StatsTpl),

    initialize: function() {
      this.data = {
        labels : ["January","February","March","April","May","June","July"],
        datasets : [
          {
            fillColor : "rgba(220,220,220,0.5)",
            strokeColor : "rgba(220,220,220,1)",
            pointColor : "rgba(220,220,220,1)",
            pointStrokeColor : "#fff",
            data : [65,59,90,81,56,55,40]
          },
          {
            fillColor : "rgba(151,187,205,0.5)",
            strokeColor : "rgba(151,187,205,1)",
            pointColor : "rgba(151,187,205,1)",
            pointStrokeColor : "#fff",
            data : [28,48,40,19,96,27,100]
          }
        ]
      };

    },

    render:function () {
      this.$el.html(this.template());
      var ctx = this.$el.find("#myChart")[0].getContext("2d");
      var myNewChart = new Chart(ctx).Bar(this.data);
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
