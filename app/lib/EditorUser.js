var projectLogic = require('../logic/project');
var util = require('../logic/util');

function EditorUser(eid, wss, ws) {
  this.eid = eid;
  this.wss = wss;
  this.ws = ws;
  this.isClosing = false;
  this.username = null;
  this.userId = null;
  this.project = null;
}

EditorUser.prototype.open = function () {
  var that = this;
  
  this.establishSession(function (err) {
    if (err) {
      util.logErr(err);
      that.close();
      return;
    }
  
    that.connSetup();
  });
};

EditorUser.prototype.close = function () {
  if (this.isClosing) {
    return;
  }
  this.isClosing = true;
  this.wss.unregisterUser(this);
  
  var that = this;
  this.projectClose(function () {
    that.connClose();
  });
};

EditorUser.prototype.establishSession = function (callback) {
  var that = this;
  
  this.wss.app.getReqSession(this.ws.upgradeReq, function (err, session) {
    if (err) return callback(err);
    if (typeof session.userId !== 'string') return callback('no-id-set');
    
    that.username = session.username;
    that.userId = session.userId;
    
    callback();
  });
};

EditorUser.prototype.connSetup = function () {
  this.setupListeners();
};

EditorUser.prototype.connClose = function () {
  this.ws.close();
};

EditorUser.prototype.setupListeners = function () {
  var messageFuncs = {};

  for (var name in this) {
    if (name.indexOf('onMessage_') === 0) {
      var msgName = name.substring('onMessage_'.length, name.length);
      messageFuncs[msgName] = this[name].bind(this);
    }
  }

  this.ws.onmessage = function (event) {
    var json = JSON.parse(event.data);
    var type = json[0];
    var msg = json[1];
    messageFuncs[type](msg);
  };

  this.ws.onclose = this.onSocketClose.bind(this);
};

EditorUser.prototype.onMessage_openProject = function (projectId) {
  if (this.project) return this.close();
  
  var that = this;
  this.wss.openProject(this, projectId, function (err, project) {
    if (err) {
      that.sendMsg('openProject', {error: err}, function () {
        that.close();
      });
      return;
    }
    that.project = project;
    that.sendMsg('openProject', {project: project.doc});
  });
};

EditorUser.prototype.onSocketClose = function (event) {
  this.close();
};

EditorUser.prototype.projectClose = function (callback) {
  callback();
};

EditorUser.prototype.sendMsg = function (type, msg) {
  this.ws.send(JSON.stringify([type, msg]));
};

EditorUser.prototype.sendMsg = function (type, msg, callback) {
  this.ws.send(JSON.stringify([type, msg]), callback);
};

module.exports = EditorUser;
