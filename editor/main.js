var App = require('./App');

function main(projectId) {
  // TODO: If the resolution is too small, go back since the editor is not
  // supported on mobile.

  var opts = {
    workspaceElem: $('#workspace').get(0),
    menuElem: $('#menu').get(0),
    projectId: projectId
  };

  var app = new App(opts);
  app.load();
}

require('./fullscreen-api-polyfill');

var isFullScreen = false;
$('#fullscreen').click(function (e) {
  e.preventDefault();
  isFullScreen = !isFullScreen;
  if (isFullScreen) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

window.main = main;
