var crypto = require('crypto');
var fs = require('fs');
var util = require('./util');

var app = null;

exports.setApp = function (pApp) {
  app = pApp;
};

exports.moveFile = function (path, callback) {
  getFileHash(path, function (err, hash) {
    if (err) return callback(err);

    var dir = app.config.dirs.store + '/' + hash.substring(0, 3);
    var file = dir + '/' + hash.substring(3);

    moveIfNecessary(path, dir, file, function (err) {
      if (err) return callback(err);
      callback(undefined, hash);
    });
  });
};

exports.moveFiles = function (paths, callback) {
  var i = 0, len = paths.length;
  var tree = {};

  var next = function () {
    if (i >= len) return callback(undefined, tree);

    exports.moveFile(paths[i], function (err, hash) {
      if (err) return callback(err);
      tree[paths[i]] = hash;
      i++;
      next();
    });
  };

  next();
};

exports.getPath = function (hash) {
  var dir = app.config.dirs.store + '/' + hash.substring(0, 3);
  var file = dir + '/' + hash.substring(3);
  return file;
};

function getFileHash(path, callback) {
  var fd = fs.createReadStream(path);
  var hash = crypto.createHash('sha1');
  hash.setEncoding('hex');

  fd.on('end', function () {
    hash.end();
    callback(undefined, hash.read());
  });

  fd.pipe(hash);
}

function moveIfNecessary(path, dir, file, callback) {
  fs.exists(file, function (exists) {
    if (exists) return callback();

    fs.mkdir(dir, function (err) {
      if (err) return callback(err);

      fs.rename(path, file, function (err) {
        if (err) return callback(err);
        callback();
      });
    });
  });
}
