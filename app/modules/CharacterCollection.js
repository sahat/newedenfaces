define(['underscore', 'backbone', 'CharacterModel'], function(_, Backbone, CharacterModel) {

  var CharacterCollection = Backbone.Collection.extend({
    model: CharacterModel,
    url: '/api/characters'
  });

  return CharacterCollection;
});
