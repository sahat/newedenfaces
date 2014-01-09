define(['backbone', 'models/Character'], function(Backbone, CharacterModel) {

  var CharacterCollection = Backbone.Collection.extend({
    model: CharacterModel,
    url: '/api/characters'
  });

  return CharacterCollection;
});
