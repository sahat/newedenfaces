define([
  'underscore',
  'jquery',
  'backbone',
  'text!templates/leaderboard-item.html'
], function(_, $, Backbone, LeaderboardItemTpl) {

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
