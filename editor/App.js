var Gui = require('./Gui');
var WebSocketServer = require('./WebSocketServer');
var Prefs = require('./Prefs');
var Project = require('./Project');
var Modal = require('./Modal');

function App(opts) {
  this.opts = opts;
  this.wss = new WebSocketServer(this);
  this.userDoc = null;
  this.prefs = null;
  this.gui = null;
  this.project = new Project(this, opts.projectId);
  this.modal = new Modal(this);
  this.actions = {};
}

App.prototype.load = function () {
  var that = this;

  this.wss.setup(function () {
    that.loadUserDoc(function () {
      that.prefs = new Prefs(that, that.userDoc.prefs);
      that.gui = new Gui(that, that.opts);
      that.gui.setup();
      that.setupActions();
      that.modal.setup();
      that.project.load();
    });
  });
};

App.prototype.setupActions = function () {
  this.actions.build = this.project.build.bind(this.project);
  this.actions.commit = this.project.commit.bind(this.project);
  this.actions.fullscreen = this.gui.toggleFullscreen.bind(this.gui);
  this.actions.editorSettings = this.modal.showEditorSettings.bind(this.modal);
};

App.prototype.loadUserDoc = function (callback) {
  var that = this;
  this.wss.callMsg('getUserDoc', 1, function (msg) {
    if (msg.error) return that.panic(msg.error);
    that.userDoc = msg.userDoc;
    callback();
  });
};

App.prototype.onMessage_someMessage = function (msg) {
};

App.prototype.panic = function (error) {
  alert('Fatal error.');
  console.log(error);
  console.trace();
};

module.exports = App;
