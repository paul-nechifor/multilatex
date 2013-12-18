var fs = require('fs');
var util = require('./util');

var app = null;

exports.setApp = function (pApp) {
  app = pApp;
};

// TODO Improve. This is a simple placeholder.
exports.getNewDir = function (callback) {
  util.getRandomDir(app.config.dirs.heads, function (err, path) {
    if (err) {
      callback(err);
      return;
    }
    
    callback(err);
  });
};
