define(function(require, exports, module) {
  var _ = require('underscore');
  var $ = require('jquery');
  var toastr = require('toastr');
  var Backbone = require('backbone');
  var CharacterSummaryTpl = require('text!templates/character-summary.html');
  var magnificPopup = require('magnific-popup');
  var alertify = require('alertify');

  var CharacterSummaryView = Backbone.View.extend({
    template: _.template(CharacterSummaryTpl),

    events: {
      'click #report': 'reportPlayer',
      'click #wrong-gender': 'wrongGender'
    },

    initialize: function(options) {
      this.options = options || {};
      document.title = this.model.get('name') + ' - ' + document.title;
    },

    wrongGender: function() {
      var characterId = this.model.get('characterId');
      $.post('/api/report/gender', { characterId: characterId }, function(data) {
        toastr.info('Your report has been submitted');
      });
    },

    reportPlayer: function(e) {
      var $reportButton = this.$el.find('#report');
      var characterId = this.model.get('characterId');
      $.ajax({
        type: 'POST',
        url: '/api/report',
        data: this.model.toJSON(),
        success: function(data) {
          if (data.message.indexOf('deleted') !== -1) {
            alertify.success(data.message);
            Backbone.history.navigate('/', { trigger: true });
          } else {
            alertify.success(data.message);
          }
          $reportButton.attr('disabled', true);
          localStorage['reported-' + characterId] = 'True';
        },
        error: function(jqXHR) {
          alertify.error(jqXHR.responseJSON.message);
        }
      });
    },

    render: function () {
      var data = {
        model: this.model.toJSON(),
        winLossRatio: this.options.winLossRatio
      };

      this.$el.html(this.template(data));

      if (localStorage['reported-'+this.model.get('characterId')] === 'True') {
        this.$el.find('#report').attr('disabled', true);
      }

      this.$el.find('.magnific-popup').magnificPopup({
        type: 'image',
        closeOnContentClick: true,
        mainClass: 'my-mfp-zoom-in'
      });

      return this;
    },

    selectMenuItem: function(menuItem) {
      $('.navbar .nav li').removeClass('active');
      if (menuItem) {
        $('.' + menuItem).addClass('active');
      }
    }
  });

  return CharacterSummaryView;
});
