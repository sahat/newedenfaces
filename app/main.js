// Break out the application running from the configuration definition to
// assist with testing.
require(['config'], function() {
  // Kick off the application.
  require(['app', 'router'], function(app, Router) {
    // Define your master router on the application namespace and trigger all
    // navigation from this instance.
    app.router = new Router();

    app.router.bind("all",function(route, router) {
      $('#wrap').css('background-image', 'none');
      $('.navbar').removeClass('bg').removeClass('bg-black');
      $('.footer').removeClass('transparent');
      $('.dropdown-menu').removeClass('bg-inverse');
    });

    // Trigger the initial route and enable HTML5 History API support, set the
    // root folder to '/' by default.  Change in app.js.
    Backbone.history.start({ pushState: true, root: app.root });
  });
});
