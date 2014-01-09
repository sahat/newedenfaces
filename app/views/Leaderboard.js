define([
  'underscore',
  'jquery',
  'backbone',
  'views/LeaderboardItem'
], function(_, $, Backbone, LeaderboardItemView) {

  var LeaderboardView = Backbone.View.extend({

    tagName: 'ul',

    className: 'inline',

    render: function() {
      this.collection.each(function(character) {
        var leaderboardItemView = new LeaderboardItemView({ model: character });
        this.$el.append(leaderboardItemView.render().el);
      }, this);
      return this;
    }
  });

  return LeaderboardView;
});
