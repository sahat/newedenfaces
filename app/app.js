define(['jquery', 'bootstrap-dropdown'], function($) {

  var socket = io.connect('ws://www.newedenfaces.com:8000');
  socket.on('userCount', function (data) {
    $('#userCount').text(data.userCount);
  });

  $(document).ajaxStart(function() {
    if ($("#progress").length === 0) {
      $("body").append($("<div><dt/><dd/></div>").attr("id", "progress"));
      $("#progress").width((50 + Math.random() * 30) + "%");
    }
  });

  $(document).ajaxComplete(function() {
    $('.spinner').css('z-index', -1);
    $("#progress").width("101%").delay(200).fadeOut(900, function() {
      $(this).remove();
    });
  });

  var app = {};
  app.root = '/';

  return app;
});
