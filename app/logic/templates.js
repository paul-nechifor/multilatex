var fs = require('fs');
var userLogic = require('./user');
var projectLogic = require('./project');
var util = require('./util');
var App = require('../lib/App');
var ProjectUploadHandler = require('../lib/ProjectUploadHandler');

var app = null;

exports.recreate = function (config, callback) {
  app = new App(config);
  app.load(function () {
    recreate(function (err) {
      app.stop(function () {
        callback(err);
      });
    });
  });
};

function recreate(callback) {
  recreateUser(function (err, user) {
    if (err) return callback(err);
    recreateTemplates(user, callback);
  });
}

function recreateUser(callback) {
  userLogic.getUser('templates', function (err, user) {
    if (err) return callback(err);
    if (user) return callback(undefined, user); // User exists.

    var opts = {
      username: 'templates',
      password: util.randomBase36(16) // It doesn't matter.
    };
    userLogic.register(opts, callback);
  });
}

function recreateTemplates(user, callback) {
  var dir = __dirname + '/../../data/templates';
  fs.readdir(dir, function (err, files) {
    if (err) return callback(err);

    var i = 0;

    var next = function () {
      if (i >= files.length) return callback();

      recreateTemplate(user, files[i], dir + '/' + files[i], function (err) {
        if (err) return callback(err);
        i++;
        next();
      });
    };

    next();
  });
}

function recreateTemplate(user, location, dir, callback) {
  projectLogic.getProject(user._id, location, function (err, project) {
    if (err) return callback(err);
    if (project) return callback(); // No need to recreate project.

    var puh = new ProjectUploadHandler(undefined, dir);
    puh.name = location;
    puh.convert(function (err) {
      if (err) return callback(err);

      var u = user.username;
      projectLogic.createFrom(u, user._id, puh, function (err, project) {
        if (err) return callback(err);
        callback();
      });
    });
  });
}