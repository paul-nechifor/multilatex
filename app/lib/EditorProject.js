var projectLogic = require('../logic/project');

function EditorProject(id, wss) {
  this.id = id;
  this.wss = wss;
  this.doc = null;
  this.isClosing = false;
  this.users = {};
  this.files = {};
}

EditorProject.prototype.openForUser = function (user, callback) {
  if (this.doc) {
    this.openForUser2(user, callback);
    return;
  }
  
  var that = this;
  this.loadDoc(function (err) {
    if (err) {
      that.close();
      callback(err);
      return;
    }
    
    that.openForUser2(user, callback);
  });
};

EditorProject.prototype.loadDoc = function (callback) {
  var that = this;
  projectLogic.getProjectById(this.id, function (err, project) {
    if (err) return callback(err);
    that.doc = project;
    callback();
  });
};

EditorProject.prototype.openForUser2 = function (user, callback) {
  if (this.doc.contribuitorsIds[user.userId] === undefined) {
    callback('not-a-project-contribuitor');
    this.closeForUser(user);
    return;
  }
  
  this.users[user.eid] = user;
  
  callback(undefined, this);
};

EditorProject.prototype.closeForUser = function (user) {
  delete this.users[user.eid];
  
  // If there are no more users, close the entire project.
  if (Object.keys(this.users).length === 0) {
    this.close();
  }
};

EditorProject.prototype.close = function () {
  if (this.isClosing) {
    return;
  }
  this.isClosing = true;
  this.wss.unregisterProject(this);
  
  // Close all the users.
  for (var userEid in this.users) {
    this.closeForUser(this.users[userEid]);
  }
  
  // Close all the files.
  // TODO
};

EditorProject.prototype.openFile = function (user, path) {
  
};

EditorProject.prototype.closeFile = function () {
  
};

module.exports = EditorProject;
