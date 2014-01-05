var WsServer = require('ws').Server;
var EditorUser = require('./EditorUser');
var EditorProject = require('./EditorProject');

function WebSocketServer(app) {
  this.app = app;
  this.wss = null;  
  this.lastUserId = 0;
  this.users = {};
  this.projects = {};
}

WebSocketServer.prototype.setup = function () {
  this.wss = new WsServer({server: this.app.server});
  this.wss.on('connection', this.onConnection.bind(this));
};

WebSocketServer.prototype.onConnection = function (ws) {
  this.lastUserId++;
  var user = new EditorUser(this.lastUserId, this, ws);
  this.users[user.eid] = user;
  user.open();
};

WebSocketServer.prototype.openProject = function (user, projectId, callback) {
  var project = this.projects[projectId];
  
  if (!project) {
    project = new EditorProject(projectId, this);
    this.projects[project.id] = project;
  }
  
  project.openForUser(user, callback);
};

WebSocketServer.prototype.unregisterUser = function (user) {
  delete this.users[user.eid];
};

WebSocketServer.prototype.unregisterProject = function (project) {
  delete this.projects[project.eid];
};

module.exports = WebSocketServer;
