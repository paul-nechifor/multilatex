var crypto = require('crypto');
var fs = require('fs');

exports.die = function (string) {
  console.trace();
  console.error(string);
  process.exit(1);
};

exports.logErr = function (err) {
  console.error('Error:');
  console.error(err);
  console.trace();
};

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
      if (err) return next();
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
        if (err) return callback(err);
        callback(undefined, path);
      });
    });
  };
  
  next();
};

exports.copyFile = function (source, target, callback) {
  var callbackUsed = false;
  
  var checkError = function (err) {
    if (err && !callbackUsed) {
      callbackUsed = true;
      callback(err);
    }
  };

  var rs = fs.createReadStream(source);
  rs.on('error', checkError);
  
  var ws = fs.createWriteStream(target);
  ws.on('error', checkError);
  
  ws.on('close', function(ex) {
    if (!callbackUsed) {
      callbackUsed = true;
      callback();
    }
  });
  rs.pipe(ws);
};

exports.pipeFile = function (file, res) {
  // TODO: set the size.
  var rs = fs.createReadStream(file);
  rs.pipe(res);
};
