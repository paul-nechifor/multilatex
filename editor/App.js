var Gui = require('./Gui');
var WebSocketServer = require('./WebSocketServer');
var Prefs = require('./Prefs');
var Project = require('./Project');

function App(opts) {
  this.opts = opts;
  this.wss = new WebSocketServer(this);
  this.userDoc = null;
  this.prefs = null;
  this.gui = null;
  this.project = new Project(this, opts.projectId);
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
      that.project.load();
    });
  });
};

App.prototype.setupActions = function () {
  this.actions.build = this.project.build.bind(this.project);
  this.actions.commit = this.project.commit.bind(this.project);
  this.actions.editorSettings =
    this.gui.modal.showEditorSettings.bind(this.gui.modal);
  this.actions.fullscreen = this.gui.toggleFullscreen.bind(this.gui);
  this.actions.showBuildLog = this.gui.modal.showBuildLog.bind(this.gui.modal);
};

App.prototype.loadUserDoc = function (callback) {
  var that = this;
  this.wss.callMsg('getUserDoc', 1, function (msg) {
    if (msg.error) return that.panic(msg.error);
    that.userDoc = msg.userDoc;
    callback();
  });
};

App.prototype.onMessage_notif = function (msg) {
  this.gui.project.notif.add(msg);
};

App.prototype.panic = function (error) {
  alert('Fatal error.');
  console.log(error);
  console.trace();
};

module.exports = App;
