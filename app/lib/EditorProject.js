var projectLogic = require('../logic/project');
var notifLogic = require('../logic/notif');
var EditorFile = require('./EditorFile');
var ObjectID = require('mongodb').ObjectID;
var util = require('../logic/util');

function EditorProject(id, wss) {
  this.id = id;
  this.idObj = new ObjectID(id);
  this.wss = wss;
  this.doc = null;
  this.notifDoc = null;
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

    notifLogic.getNotifById(project.notifId, function (err, notif) {
      if (err) return callback(err);

      that.notifDoc = notif;
      callback();
    });
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

  // TODO: Shouldn't the user be notified that he can't access this project
  // anymore?

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

  this.saveAllFiles(function (errs) {
    if (errs) util.logErr(errs);
  });
};

EditorProject.prototype.openFile = function (user, fid, callback) {
  var file = this.files[fid];
  if (file) {
    if (user.eid in file.users) {
      callback('you-have-it-open'); // This shouldn't happen now.
    } else {
      this.openFile2(file, user, callback);
    }
    return;
  }

  var headFiles = this.doc.headFiles;
  if (fid >= headFiles || fid < 0 || headFiles[fid] === null) {
    return callback('no-such-file');
  }

  file = new EditorFile(fid, this);
  this.files[file.fid] = file;

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
    projectLogic.commit(that.doc, function (err, commit) {
      if (err) return callback(err);
      callback();

      that.addNotif({
        type: 'commit',
        date: commit.created,
        order: commit.order,
        pdfCreated: !!commit.pdfFile
      });
    });
  });
};

EditorProject.prototype.chatMsg = function (user, text) {
  this.addNotif({
    type: 'chat',
    date: Date.now(),
    from: user.username,
    text: text
  });
};

EditorProject.prototype.addNotif = function (msg) {
  var that = this;

  notifLogic.addMsg(this.notifDoc._id, msg, function (err) {
    if (err) util.logErr(err);

    that.notifDoc.list.push(msg);

    for (var eid in that.users) {
      that.users[eid].sendMsg('notif', msg);
    }
  });
};

EditorProject.prototype.modFile = function (user, fid, callback) {
  // Return if this user was added to the modders.
  if (this.doc.modders[user.userId]) {
    return callback();
  }

  this.doc.modders[user.userId] = true;

  projectLogic.addModer(this.idObj, user.userId, callback);

  // TODO: Add the file to the messages.
};

EditorProject.prototype.deleteFile = function (user, fid, callback) {
  // Return if the file was deleted.
  if (!this.doc.headFiles[fid]) {
    return callback();
  }

  // Delete the file by placing null in place of its path.
  var filePath = this.doc.headFiles[fid];
  this.doc.headFiles[fid] = null;

  // If such a file is open, close it.
  var file = this.files[fid];
  if (file) {
    file.close();
  }

  projectLogic.deleteFile(this.idObj, fid, filePath, user.userId, callback);

  // TODO: Add to the messages.
};

EditorProject.prototype.saveAllFiles = function (callback) {
  var fids = Object.keys(this.files);
  var nReturned = 0;
  var errs = [];

  var onReturn = function (err) {
    if (err) {
      errs.push(err);
    }

    nReturned++;
    if (nReturned === fids.length) {
      callback(errs.length > 0 ? errs : undefined);
    }
  };

  for (var i = 0, len = fids.length; i < len; i++) {
    var file = this.files[fids[i]];
    file.save(onReturn);
  }
};

EditorProject.prototype.unregisterFile = function (file) {
  delete this.files[file.fid];
};

module.exports = EditorProject;
