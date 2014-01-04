var WsServer = require('ws').Server;
var EditorUser = require('./EditorUser');
var util = require('../logic/util');

function WebSocketServer(app) {
  this.app = app;
  this.wss = null;
}

WebSocketServer.prototype.setup = function () {
  this.wss = new WsServer({server: this.app.server});
  this.wss.on('connection', this.onConnection.bind(this));
};

WebSocketServer.prototype.onConnection = function (ws) {
  var that = this;
  
  this.app.getReqSession(ws.upgradeReq, function (err, session) {
    if (err) return util.logErr(err);
    
    if (typeof session.userId !== 'string') {
      ws.terminate();
      return;
    }
    
    that.openUser(ws, session);
  });
};

WebSocketServer.prototype.openUser = function (ws, session) {
  var editorUser = new EditorUser(this, ws, session.username, session.userId);
  editorUser.setup();
};

//WebSocketServer.prototype.onMessage_startSession = function (player, msg) {
//};

module.exports = WebSocketServer;
