define(function(require, exports, module) {
  var _ = require('underscore');
  var $ = require('jquery');
  var Backbone = require('backbone');
  var CharacterModel = require('modules/CharacterModel');

  var CharacterCollection = Backbone.Collection.extend({
    model: CharacterModel,
    url: '/api/characters'
  });

  return CharacterCollection;
});
