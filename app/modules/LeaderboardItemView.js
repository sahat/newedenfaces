define(function(require, exports, module) {
  var _ = require('underscore');
  var $ = require('jquery');
  var Backbone = require('backbone');
  var LeaderboardItemTpl = require('text!templates/leaderboard-item');

  var LeaderboardItemView = Backbone.View.extend({
    tagName: 'li',

    template: _.template(LeaderboardItemTpl),

    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }
  });

  return LeaderboardItemView;
});
