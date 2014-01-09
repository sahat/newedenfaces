define(['jquery', 'backbone'], function($, Backbone) {

  var SearchView = Backbone.View.extend({

    el: $('.navbar'),

    initialize: function(options) {
      this.options = options || {};
      $('#search').attr('placeholder', this.options.count + ' capsuleers');
    },

    events: {
      'submit form': 'submit'
    },

    submit: function(e) {
      e.preventDefault();
      var input = this.$el.find('input').val();
      if (!input) return;
      $.post('/api/characters/search', { name: input }, function(character) {
        if (character) {
          Backbone.history.navigate('/characters/' + character.characterId, { trigger: true });
        }
      });
    }
  });

  return SearchView;
});
