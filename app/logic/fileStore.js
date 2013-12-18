var crypto = require('crypto');
var fs = require('fs');
var util = require('./util');

var app = null;

exports.setApp = function (pApp) {
  app = pApp;
};

exports.moveFile = function (path, callback) {
  getFileHash(path, function (err, hash) {
    if (err) {
      callback(err);
      return;
    }
    
    var dir = app.config.dirs.store + '/' + hash.substring(0, 3);
    var file = dir + '/' + hash.substring(3);
    
    moveIfNecessary(path, dir, file, function (err) {
      if (err) {
        callback(err);
        return;
      }
      callback(undefined, hash);
    })
  });
};

function getFileHash(path, callback) {
  var fd = fs.createReadStream(path);
  var hash = crypto.createHash('sha1');
  hash.setEncoding('hex');

  fd.on('end', function() {
      hash.end();
      callback(undefined, hash.read());
  });

  fd.pipe(hash);
}
  
function moveIfNecessary(path, dir, file, callback) {
  fs.exists(file, function (exists) {
    if (exists) {
      callback();
      return;
    }
    
    fs.mkdir(dir, function (err) {
      if (err) {
        callback(err);
        return;
      }
      
      fs.rename(path, file, function (err) {
        if (err) {
          callback(err);
          return;
        }
        
        callback();
      });
    });
  });
}