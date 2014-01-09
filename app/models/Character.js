define(['backbone'], function(Backbone) {

  var CharacterModel = Backbone.Model.extend({
    urlRoot: '/api/characters',
    idAttribute: 'characterId'
  });

  return CharacterModel;
});
