define(function(require, exports, module) {
  var _ = require('underscore');
  var $ = require('jquery');
  var Backbone = require('backbone');
  var dropdown = require('bootstrap-dropdown');

  var socket = io.connect('http://localhost:8000');
  socket.on('userCount', function (data) {
    $('#userCount').text(data.userCount);
  });

  $(document).ajaxStart(function() {
    //only add progress bar if added yet.
    if ($("#progress").length === 0) {
      $("body").append($("<div><dt/><dd/></div>").attr("id", "progress"));
      $("#progress").width((50 + Math.random() * 30) + "%");
    }
  });

  $(document).ajaxComplete(function() {
    $('.spinner').css('z-index', -1);
    //End loading animation
    $("#progress").width("101%").delay(200).fadeOut(900, function() {
      $(this).remove();
    });
  });

  // Alias the module for easier identification.
  var app = module.exports;

  app.root = '/';
});
