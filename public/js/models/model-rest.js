App.Character = Backbone.Model.extend({

    urlRoot:"http://localhost:3000/characters",

    initialize:function () {
        this.characters = new App.CharacterCollection();
        this.characters.url = this.urlRoot + "/" + this.id + "/characters";
    }

});

App.CharacterCollection = Backbone.Collection.extend({

    model: App.Character,

    url: 'http://localhost:3000/characters'

});