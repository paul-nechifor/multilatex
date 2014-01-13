var MongoClient = require('mongodb').MongoClient;
var util = require('../logic/util');

function Database(url) {
  this.url = url;
  this.db = null;

  this.commits = null;
  this.projects = null;
  this.users = null;
}

Database.prototype.connect = function (callback) {
  var that = this;
  MongoClient.connect(this.url, function(err, db) {
    if (err) return util.die('Could not connect to MongoDb. Is it open?');

    that.db = db;

    that.commits = that.db.collection('commits');
    that.projects = that.db.collection('projects');
    that.users = that.db.collection('users');

    var what = [
      [that.commits, {'projectId': 1}, {w: 1}],
      [that.projects, {'userId': 1, 'location': 1}, {unique: true, w: 1}],
      [that.users, {'username': 1}, {unique: true, w: 1}]
    ];
    ensureIndices(what, callback);
  });
};

Database.prototype.disconnect = function (callback) {
  this.db.close(callback);
};

function ensureIndices(what, callback) {
  var i = 0;

  var next = function () {
    if (i >= what.length) return callback();

    what[i][0].ensureIndex(what[i][1], what[i][2], function (err) {
      if (err) return util.die(err);
      i++;
      next();
    });
  };

  next();
}

module.exports = Database;
