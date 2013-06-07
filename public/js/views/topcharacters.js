App.TopCharactersView = Backbone.View.extend({

    initialize: function () {
        this.characters = new App.CharacterCollection();
        this.characters.fetch();
        this.characterListView = new App.CharacterListView({collection: this.characters});
        this.listenTo(this.collection, 'reset', this.characterListView.render);
    },

    render:function () {
        this.$el.html(this.template());
        return this;
    },

    showMeBtnClick:function () {
        console.log("showme");
        App.shellView.search();
    }

});