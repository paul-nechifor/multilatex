var Gui = require('./Gui');
var WebSocketServer = require('./WebSocketServer');
var Project = require('./Project');
var Modal = require('./Modal');

function App(opts) {
  this.opts = opts;
  this.gui = new Gui(this, opts);
  this.wss = new WebSocketServer(this);
  this.project = new Project(this, opts.projectId);
  this.modal = new Modal(this);
  this.actions = {};
}

App.prototype.load = function () {
  var that = this;

  this.setupActions();
  this.gui.setup();
  this.modal.setup();
  this.wss.setup(function () {
    that.project.load();
  });
};

App.prototype.setupActions = function () {
  this.actions.build = this.project.build.bind(this.project);
  this.actions.commit = this.project.commit.bind(this.project);
  this.actions.fullscreen = this.gui.toggleFullscreen.bind(this.gui);
  this.actions.editorSettings = this.modal.showEditorSettings.bind(this.modal);
};

App.prototype.onMessage_someMessage = function (msg) {
};

App.prototype.panic = function (error) {
  alert('Fatal error.');
  console.log(error);
  console.trace();
};

module.exports = App;
