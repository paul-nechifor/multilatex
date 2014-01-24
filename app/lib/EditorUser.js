var projectMd = require('../models/project');
var userLogic = require('../logic/user');
var util = require('../logic/util');

function EditorUser(eid, wss, ws) {
  this.eid = eid; // Ephemeral user ID.
  this.wss = wss;
  this.ws = ws;
  this.isClosing = false;
  this.username = null;
  this.userId = null;
  this.userDoc = null;
  this.project = null;
  this.file = null;
}

EditorUser.prototype.open = function () {
  var that = this;

  this.establishSession(function (err) {
    if (err) {
      util.logErr(err);
      that.close();
      return;
    }

    that.getUserDoc(function (err) {
      if (err) {
        util.logErr(err);
        that.close();
        return;
      }

      that.connSetup();
    });
  });
};

EditorUser.prototype.close = function () {
  if (this.isClosing) {
    return;
  }
  this.isClosing = true;
  this.wss.unregisterUser(this);

  if (this.file) {
    this.file.closeForUser(this);
  }

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

EditorUser.prototype.getUserDoc = function (callback) {
  var that = this;

  userLogic.getUserById(this.userId, function (err, user) {
    if (err) return callback(err);
    if (!user) return callback('no-such-user');

    that.userDoc = user;

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

EditorUser.prototype.onMessage_getUserDoc = function () {
  this.sendMsg('getUserDoc', {userDoc: this.userDoc});
};

EditorUser.prototype.onMessage_openProject = function (projectId) {
  // If a project is already opened, kick.
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
    that.sendMsg('openProject', {project: projectMd.getPublic(project.doc)});
  });
};

EditorUser.prototype.onMessage_openFile = function (fid) {
  // If the project isn't open, kick.
  if (!this.project) return this.close();
  
  // If a file was open, close it.
  if (this.file) {
    this.file.closeForUser(this);
  }
  
  var that = this;
  this.project.openFile(this, fid, function (err, file) {
    if (err) return that.sendMsg('openFile', {error: err});
    
    that.file = file;
    
    that.sendMsg('openFile', {});
  });
};

EditorUser.prototype.onMessage_buildProject = function () {
  // If the project isn't open, kick.
  if (!this.project) return this.close();

  var that = this;
  this.project.build(function (err) {
    if (err) return that.sendMsg('buildProject', {error: err});
    that.sendMsg('buildProject', {});
  });
};

EditorUser.prototype.onMessage_commitProject = function () {
  // If the project isn't open, kick.
  if (!this.project) return this.close();

  var that = this;
  this.project.commit(function (err) {
    if (err) return that.sendMsg('commitProject', {error: err});
    that.sendMsg('commitProject', {});
  });
};

EditorUser.prototype.onMessage_savePrefs = function (prefs) {
  var that = this;
  userLogic.savePrefs(this.userId, prefs, function (err) {
    if (err) return that.sendMsg('savePrefs', {error: err});
    that.sendMsg('savePrefs', {});
  });
};

EditorUser.prototype.onMessage_modFile = function (fid) {
  // If the project isn't open, kick.
  if (!this.project) return this.close();

  this.project.modFile(this, fid, function (err) {
    if (err) util.logErr(err);
  });
};

EditorUser.prototype.onMessage_deleteFile = function (fid) {
  // If the project isn't open, kick.
  if (!this.project) return this.close();

  this.project.deleteFile(this, fid, function (err) {
    if (err) util.logErr(err);
  });

  console.log(fid);
};

EditorUser.prototype.onMessage_moveFile = function (fid) {
};

EditorUser.prototype.onSocketClose = function (event) {
  this.close();
};

EditorUser.prototype.projectClose = function (callback) {
  callback();
};

EditorUser.prototype.sendMsg = function (type, msg, callback) {
  this.ws.send(JSON.stringify([type, msg]), callback);
};

module.exports = EditorUser;
