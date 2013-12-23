define(function(require, exports, module) {
  var _ = require('underscore');
  var $ = require('jquery');
  var Backbone = require('backbone');
  var typeahead = require('typeahead');

  var SearchView = Backbone.View.extend({
    el: $('.navbar'),

    initialize: function() {
      $('#search').typeahead({
        name: 'name',
        local: this.collection.pluck('name')
      });
      $('#search').attr('placeholder', this.collection.length + ' capsuleers');
    },

    events: {
      'submit form': 'submit'
    },

    submit: function(e) {
      e.preventDefault();
      var input = this.$el.find('input').val();

      var queryMatch = this.collection.filter(function(model) {
        return model.get('name').toLowerCase() === input.toLowerCase();
      });

      if (!queryMatch.length) {
        return;
      }
      var characterId = queryMatch[0].get('characterId');

      if (characterId) {
        Backbone.history.navigate('/characters/' + characterId, { trigger: true });
      } else {
        toastr.warning('No query match');
      }
    }
  });

  return SearchView;
});
