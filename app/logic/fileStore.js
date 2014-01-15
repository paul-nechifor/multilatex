var crypto = require('crypto');
var fs = require('fs');
var util = require('./util');

var app = null;

exports.setApp = function (pApp) {
  app = pApp;
};

exports.store = function (path, andDelete, callback) {
  getFileHash(path, function (err, hash) {
    if (err) return callback(err);

    var dir = app.config.dirs.store + '/' + hash.substring(0, 3);
    var file = dir + '/' + hash.substring(3);

    copyIfNecessary(path, dir, file, andDelete, function (err) {
      if (err) return callback(err);
      callback(undefined, hash);
    });
  });
};

exports.storeAll = function (paths, andDelete, callback) {
  var i = 0, len = paths.length;
  var hashes = [];

  var next = function () {
    if (i >= len) return callback(undefined, hashes);

    if (paths[i] === null) {
      hashes.push(null);
      i++;
      next();
      return;
    }

    exports.store(paths[i], andDelete, function (err, hash) {
      if (err) return callback(err);
      hashes.push(hash);
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

  var returned = false;

  fd.on('error', function (err) {
    callback(err);
    returned = true;
  });

  fd.on('end', function () {
    hash.end();
    if (!returned) {
      callback(undefined, hash.read());
    }
  });

  fd.pipe(hash);
}

function copyIfNecessary(path, dir, file, andDelete, callback) {
  fs.exists(file, function (exists) {
    if (exists) {
      if (andDelete) {
        fs.unlink(path, callback);
      } else {
        callback();
      }
      return;
    }

    fs.mkdir(dir, function (err) {
      // Ignore this error.

      if (andDelete) {
        fs.rename(path, file, callback);
      } else {
        util.copyFile(path, file, callback);
      }
    });
  });
}
