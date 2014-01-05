var fs = require('fs');

function EditorFile(path, project) {
  this.path = path;
  this.project = project;
  this.users = {};
  this.isClosing = false;
  this.lines = null;
}

EditorFile.prototype.open = function (callback) {
  var path = this.project.doc.headPath + '/' + this.path;
  var that = this;
  fs.readFile(path, {encoding: 'utf-8'}, function (err, data) {
    if (err) return callback(err);
    that.lines = data.split('\n');
    callback();
  });
};

EditorFile.prototype.getData = function () {
  return this.lines;
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
};

module.exports = EditorFile;
