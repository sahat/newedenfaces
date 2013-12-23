require.config({
  paths: {
    'vendor': './vendor',
    'almond': 'vendor/bower/almond/almond',
    'underscore': 'vendor/lodash/dist/lodash.underscore',
    'jquery': 'vendor/jquery/jquery',
    'backbone': 'vendor/backbone/backbone',
    'text': 'vendor/requirejs-text/text',
    'toastr': 'vendor/toastr',
    'typeahead': 'vendor/typeahead.js/dist/typeahead',
    'magnific-popup': 'vendor/magnific-popup/dist/jquery.magnific-popup',
    'bootstrap-dropdown': 'vendor/bootstrap/js/bootstrap-dropdown'
  },

  shim: {
    'backbone': {
      deps: ['jquery', 'underscore'],
      exports: 'Backbone'
    },
    'magnific-popup': {
      deps: ['jquery']
    },
    'typeahead': {
      deps: ['jquery']
    },
    'bootstrap-dropdown': {
      deps: ['jquery']
    }
  }
});
