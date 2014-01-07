var Gui = require('./Gui');
var WebSocketServer = require('./WebSocketServer');
var Project = require('./Project');

function App(opts) {
  this.opts = opts;
  this.gui = new Gui(this, opts);
  this.wss = new WebSocketServer(this);
  this.project = new Project(this, opts.projectId);
}

App.prototype.load = function () {
  var that = this;

  this.gui.setup();
  this.wss.setup(function () {
    that.project.load();
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
