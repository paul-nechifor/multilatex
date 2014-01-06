var fs = require('fs');

function EditorFile(path, project) {
  this.path = path;
  this.project = project;
  this.shareJsId = encodeURIComponent(project.doc._id + ' ' + path);
  this.filePath = project.doc.headPath + '/' + path;
  this.users = {};
  this.isClosing = false;
}

EditorFile.prototype.open = function (callback) {
  this.createShareJsDoc(callback);
};

EditorFile.prototype.save = function (callback) {
  var that = this;
  this.getShareJsDoc(function (err, doc) {
    if (err) return callback(err);

    fs.writeFile(that.filePath, doc, function (err) {
      if (err) return callback(err);
      callback();
    });
  });
};

EditorFile.prototype.createShareJsDoc = function (callback) {
  var that = this;
  fs.readFile(this.filePath, {encoding: 'utf-8'}, function (err, data) {
    if (err) return callback(err);

    var shareJs = that.project.wss.app.shareJs;
    shareJs.create(that.shareJsId, 'text', null, function (err, doc) {
      if (err) return callback(err);

      var opData = {
        op: [{i: data, p: 0}],
        v: 0,
        meta: null
      };

      shareJs.applyOp(that.shareJsId, opData, function (err, v) {
        if (err) return callback(err);
        callback();
      });
    });
  });
};

EditorFile.prototype.getShareJsDoc = function (callback) {
  var shareJs = this.project.wss.app.shareJs;

  shareJs.getSnapshot(this.shareJsId, function (err, s) {
    if (err) return callback(err);
    callback(undefined, s.snapshot);
  });
};

EditorFile.prototype.closeShareJsDoc = function (callback) {
  var shareJs = this.project.wss.app.shareJs;

  shareJs.delete(this.shareJsId, function (err) {
    if (err) return callback(err);
    callback(undefined);
  });
};

EditorFile.prototype.closeForUser = function (user) {
  delete this.users[user.eid];

  // If there are no more users, close the entire project.
  if (Object.keys(this.users).length === 0) {
    this.close();
  }
};

EditorFile.prototype.close = function () {
  if (this.isClosing) {
    return;
  }
  this.isClosing = true;
  this.project.unregisterFile(this);
  this.closeShareJsDoc(function (err) {});
};

module.exports = EditorFile;
