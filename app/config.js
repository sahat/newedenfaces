require.config({
  paths: {
    'vendor': './vendor',
    'almond': 'vendor/almond',
    'underscore': 'vendor/lodash.underscore.min',
    'jquery': 'vendor/jquery.min',
    'backbone': 'vendor/backbone',
    'text': 'vendor/requirejs-text',
    'toastr': 'vendor/toastr.min',
    'typeahead': 'vendor/typeahead.min',
    'magnific-popup': 'vendor/jquery.magnific-popup.min',
    'bootstrap-dropdown': 'vendor/bootstrap-dropdown'
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
    },
    'toastr': {
      deps: ['jquery'],
      exports: 'toastr'
    }
  }
});
