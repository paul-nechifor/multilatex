var fs = require('fs');
var util = require('../lib/util');

var app = null;

exports.setApp = function (pApp) {
  app = pApp;
};

// TODO Improve. This is a simple placeholder.
exports.getNewDir = function (callback) {
  var next = function () {
    var path = app.config.dirs.heads + '/' + util.randomBase36(8);
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
