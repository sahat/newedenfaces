define([
  'underscore',
  'jquery',
  'backbone',
  'alertify',
  'views/BrowseItem',
  'text!templates/browse.html'
], function(_, $, Backbone, alertify, BrowseItemView, BrowseTpl) {

  var BrowseView = Backbone.View.extend({

    template: _.template(BrowseTpl),

    events: {
      'click #nextPage': 'nextPage'
    },

    initialize: function(options) {
      _.bindAll(this, 'render');
      this.page = 1;
      this.options = options || {};
    },
    render: function () {
      var self = this;
      self.collection.getFirstPage().done(function(data) {
        self.$el.html(self.template());
        var browseItemView = new BrowseItemView({ collection: data });
        $('#images').append(browseItemView.render().el);

      });
      return this;
    },

    nextPage: function() {
      this.collection.getNextPage().done(function(data) {
        var browseItemView = new BrowseItemView({ collection: data });
        if ($('.photogrid').length > 210) {
          alertify.log('Clearing Previous Images');
          $('#images').html(browseItemView.render().el);
        } else {
          $('#images').append(browseItemView.render().el);
        }
      });
    },

    selectMenuItem: function(menuItem) {
      $('.navbar .nav li').removeClass('active');
      if (menuItem) {
        $('.' + menuItem).addClass('active');
      }
    }
  });

  return BrowseView;
});
