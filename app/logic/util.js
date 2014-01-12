var crypto = require('crypto');
var fs = require('fs');

var app = null;

exports.setApp = function (pApp) {
  app = pApp;
};

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

// TODO: make this funciton quit after a few times.
exports.getRandomDir = function (parent, callback) {
  var next = function () {
    var path = parent + '/' + exports.randomBase36(16);
    fs.mkdir(path, function (err) {
      if (err) return next();
      callback(path);
    });
  };
  
  next();
};

exports.getTmpDir = function (callback) {
  exports.getRandomDir(app.config.dirs.tmp, function (path) {
    callback(undefined, path);
  });
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
  
  ws.on('close', function (ex) {
    if (!callbackUsed) {
      callbackUsed = true;
      callback();
    }
  });
  rs.pipe(ws);
};

exports.dirWalk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function (err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function (file) {
      file = dir + '/' + file;
      fs.stat(file, function (err, stat) {
        if (stat && stat.isDirectory()) {
          exports.dirWalk(file, function (err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          results.push(file);
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

exports.pipeFile = function (file, res) {
  // TODO: set the size.
  var rs = fs.createReadStream(file);
  rs.on('error', function (err) {
    exports.logErr(err);
  });
  rs.pipe(res);
};
