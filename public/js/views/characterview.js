App.CharacterView = Backbone.View.extend({

    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    }

});

