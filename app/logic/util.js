var crypto = require('crypto');
var fs = require('fs');

exports.die = function (string) {
  console.trace();
  console.error(string);
  process.exit(1);
}

var BASE36 = '0123456789abcdefghijklmnopqrstuvwxyz';

exports.randomBase36 = function (length) {
    var ret = '';
    var index;

    for (var i = 0; i < length; i++) {
        index = (Math.random() * BASE36.length) | 0;
        ret += BASE36[index];
    }

    return ret;
};

exports.sha1Sum = function (string) {
  var hash = crypto.createHash('sha1');
  hash.update(string);
  return hash.digest('hex');
};

exports.getRandomDir = function (parent, callback) {
  var next = function () {
    var path = parent + '/' + exports.randomBase36(8);
    fs.mkdir(path, function (err) {
      if (err) {
        next();
        return;
      }
      
      callback(path);
    });
  };
  
  next();
};

exports.getRandomFile = function (parent, callback) {
  var next = function () {
    var path = parent + '/' + exports.randomBase36(8);
    fs.open(path, 'wx', function (err, fd) {
      if (err) {
        if (err.code === 'EEXIST') {
          next();
        } else {
          callback(err);
        }
        return;
      }
      
      fs.close(fd, function (err) {
        if (err) {
          callback(err);
          return;
        }
        callback(undefined, path);
      });
    });
  };
  
  next();
};
