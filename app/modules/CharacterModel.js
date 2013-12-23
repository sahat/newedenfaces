define(function(require, exports, module) {
  var _ = require('underscore');
  var Backbone = require('backbone');

  var CharacterModel = Backbone.Model.extend({
    urlRoot: '/api/characters',
    idAttribute: 'characterId'
  });

  return CharacterModel;
});
