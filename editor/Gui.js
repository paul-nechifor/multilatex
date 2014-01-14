var MenuBar = require('./MenuBar');
var Positioning = require('./Positioning');
var ProjectView = require('./ProjectView');
var EditorView = require('./EditorView');
var OutputView = require('./OutputView');
var Vert3PaneView = require('./Vert3PaneView');
require('./fullscreen-api-polyfill');

function Gui(app, opts) {
  this.app = app;
  this.menuBar = new MenuBar(app, opts);
  this.pos = new Positioning({
  });
  this.project = new ProjectView(app);
  this.editor = new EditorView(app);
  this.output = new OutputView(app);
  this.vert3PaneView = new Vert3PaneView(app, opts,
    [this.project, this.editor, this.output]);
  this.isFullscreen = false;
}

Gui.prototype.setup = function () {
  this.menuBar.setup();

  var jWindow = $(window);
  this.pos.realign(jWindow.width(), jWindow.height());
  this.vert3PaneView.setup(this.pos);

  var that = this;
  window.onresize = function () {
    that.realign();
  };
};

Gui.prototype.realign = function () {
  var jWindow = $(window);
  this.pos.realign(jWindow.width(), jWindow.height());
  this.vert3PaneView.realign(this.pos);
};

Gui.prototype.toggleFullscreen = function () {
  this.isFullscreen = !this.isFullscreen;
  if (this.isFullscreen) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

module.exports = Gui;
