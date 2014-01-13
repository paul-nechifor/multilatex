var projectLogic = require('../logic/project');
var EditorFile = require('./EditorFile');

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
    if (!project) return callback('not-found');
    that.doc = project;
    callback();
  });
};

EditorProject.prototype.openForUser2 = function (user, callback) {
  if (this.doc.contributorsIds[user.userId] === undefined) {
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

  // Close all the users (and they close all their files).
  for (var eid in this.users) {
    this.closeForUser(this.users[eid]);
  }
};

EditorProject.prototype.openFile = function (user, path, callback) {
  var file = this.files[path];
  if (file) {
    if (user.eid in file.users) {
      callback('you-have-it-open'); // This shouldn't happen now.
    } else {
      this.openFile2(file, user, callback);
    }
    return;
  }
  
  if (!(path in this.doc.headTree)) {
    return callback('no-such-file');
  }
  
  file = new EditorFile(path, this);
  this.files[file.path] = file;
  
  var that = this;
  file.open(function (err) {
    if (err) return callback(err);
    that.openFile2(file, user, callback);
  });
};

EditorProject.prototype.openFile2 = function (file, user, callback) {
  file.users[user.eid] = user;
  callback(undefined, file);
};

EditorProject.prototype.build = function (callback) {
  var that = this;
  this.saveAllFiles(function (errs) {
    if (errs) return callback(errs);
    projectLogic.build(that.doc, callback);
  });
};

EditorProject.prototype.commit = function (callback) {
  var that = this;
  this.saveAllFiles(function (errs) {
    if (errs) return callback(errs);
    projectLogic.commit(that.doc, callback);
  });
};

EditorProject.prototype.saveAllFiles = function (callback) {
  var paths = Object.keys(this.files);
  var nReturned = 0;
  var errs = [];

  var onReturn = function (err) {
    if (err) {
      errs.push(err);
    }

    nReturned++;
    if (nReturned === paths.length) {
      callback(errs.length > 0 ? errs : undefined);
    }
  };

  for (var i = 0, len = paths.length; i < len; i++) {
    var file = this.files[paths[i]];
    file.save(onReturn);
  }
};

EditorProject.prototype.unregisterFile = function (file) {
  delete this.files[file.path];
};

module.exports = EditorProject;
