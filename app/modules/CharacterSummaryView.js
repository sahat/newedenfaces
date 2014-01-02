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
          console.log(data);
          // JavaScript way of checking if string contains a substring
          if (data.indexOf('deleted') !== -1) { // contains deleted
            toastr.error(data);
            Backbone.history.navigate('/', { trigger: true });
          } else if (data.indexOf('reported') !== -1) { // contains reported
            toastr.warning(data);
          }

          // Prevents users from reporting multiple times
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
