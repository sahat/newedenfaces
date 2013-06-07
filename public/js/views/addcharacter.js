App.AddCharacterView = Backbone.View.extend({

    events:{
        "submit form":"submit"
    },

    render:function () {
        this.$el.html(this.template());
        return this;
    },

    submit: function(e) {
        e.preventDefault();
        console.log("clicked on add character button");
        console.log(this.$('input[name=addcharacter]').val());
        Backbone.history.navigate('#', true);
    }

});