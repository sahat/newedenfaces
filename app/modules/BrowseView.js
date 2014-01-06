define(['underscore', 'jquery', 'backbone', 'modules/BrowseItemView',
  'text!templates/browse.html', 'PageableCollection', 'alertify'], function(_, $, Backbone, BrowseItemView, BrowseTpl, PageableCollection, alertify) {
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

    // TODO: Remember last page when navigating away

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
