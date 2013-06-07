App.CharacterListView = Backbone.View.extend({

    initialize: function() {
        console.log('Collection:', this.collection);
    },

    tagName:'tbody',

    render: function() {
        this.collection.each(function(character) {  
            console.log('CHARACTER', character)
            var cliv = new CharacterListItemView({ model: character });
            this.$el.append(cliv.render().el);
            console.log(cliv.render().el)
        }, this);

        console.log()
    }

});


App.CharacterListItemView = Backbone.View.extend({

    tagName: 'tr',

    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }

});
