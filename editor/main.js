var App = require('./App');

function main() {
  // TODO: If the resolution is too small, go back since the editor is not
  // supported on mobile.

  var opts = {
    workspaceElem: $('#workspace').get(0),
    menuElem: $('#menu').get(0),
    projectId: window.projectId
  };

  var app = new App(opts);
  app.load();

  window.showBuildLog = function () {
    app.actions.showBuildLog();
  };

  window.gotoFileLine = function (fileId, lineNo) {
    app.gui.editor.gotoFileLine(fileId, lineNo);
  };
}

$(document).ready(main);
