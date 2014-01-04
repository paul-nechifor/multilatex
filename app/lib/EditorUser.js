var projectLogic = require('../logic/project');

function EditorUser(wss, ws, username, userId) {
  this.wss = wss;
  this.ws = ws;
  this.username = username;
  this.userId = userId;
}

EditorUser.prototype.setup = function () {
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

  this.ws.onclose = this.onClose.bind(this);
};

EditorUser.prototype.onMessage_projectDoc = function (projectId) {
  var that = this;
  projectLogic.getProjectById(projectId, function (err, project) {
    that.sendMsg('projectDoc', err ? null : project);
  });
};

EditorUser.prototype.onClose = function (event) {
};

EditorUser.prototype.send = function (str) {
  this.ws.send(str);
};

EditorUser.prototype.sendMsg = function (type, msg) {
  this.ws.send(JSON.stringify([type, msg]));
};

module.exports = EditorUser;