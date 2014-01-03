define(function(require, exports, module) {
  var _ = require('underscore');
  var $ = require('jquery');
  var alertify = require('alertify');
  var Backbone = require('backbone');
  var CharacterModel = require('modules/CharacterModel');
  var AddCharacterTpl = require('text!templates/add-character.html');
  var AddCharacterView = Backbone.View.extend({
    template: _.template(AddCharacterTpl),

    events: {
      'submit form': 'submit'
    },

    render:function () {
      this.$el.html(this.template());
      return this;
    },

    submit: function(e) {
      e.preventDefault();

      var helpBlock = this.$el.find('.help-block');
      var controlGroup = this.$el.find('.control-group');
      var inputField = this.$el.find('input[name=addcharacter]');
      var submitBtn = this.$el.find('button');
      var gender = this.$el.find('input:radio[name=genderRadios]:checked').val();

      if (!gender) return alertify.error('Please specify character\'s gender');

      var newCharacter = new CharacterModel({
        name: inputField.val(),
        gender: gender
      });

      newCharacter.save(null, {
        success: function() {
          Backbone.history.navigate('#', { trigger: true });
          alertify.success('Character has been added successfully');
        },
        error: function(model, response) {
          controlGroup.addClass('error');
          submitBtn.removeClass('btn-primary').addClass('btn-danger');
          inputField.focus();
          if (response.status === 409) {
            helpBlock.html('<a href="#characters/' + response.responseJSON.characterId + '">' + model.get('name') + '</a> is already in our system.');
          } else {
            helpBlock.text(inputField.val() + ' is not a registered citizen of New Eden');
            alertify.error(response.responseJSON.message)
          }
        }
      });
    },

    selectMenuItem: function(menuItem) {
      $('.navbar .nav li').removeClass('active');
      if (menuItem) {
        $('.' + menuItem).addClass('active');
      }
    }
  });

  return AddCharacterView;
});
