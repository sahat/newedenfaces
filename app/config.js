require.config({
  paths: {
    'vendor': './vendor',
    'almond': 'vendor/bower/almond/almond',
    'underscore': 'vendor/lodash/dist/lodash.underscore',
    'jquery': 'vendor/jquery/jquery',
    'backbone': 'vendor/backbone/backbone',
    'text': 'vendor/requirejs-text/text'
  },

  shim: {
    'backbone': {
      deps: ['jquery', 'underscore'],
      exports: 'Backbone'
    }
  }
});
