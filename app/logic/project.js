var headDir = require('./headDir');
var util = require('./util');
var projectMd = require('../models/project');

var app = null;

exports.setApp = function (pApp) {
  app = pApp;
};

exports.create = function (opts, callback) {
  var err = checkLocationValidity(opts.location);
  if (err) return callback(err);
  
  projectMd.init(opts, function (err, doc) {
    if (err) return callback(err);
  
    createInDb(doc, function (err, project) {
      if (err) return callback(err);

      createAndInitHead(project, function (err) {
        if (err) return callback(err);
        callback(undefined, project);
      });
    });
  });
};

exports.getProject = function (userId, location, callback) {
  var query = {userId: userId, location: location};
  app.db.projects.findOne(query, function (err, item) {
    if (err) return callback(err);
    if (!item) return callback('project-not-found');
    callback(undefined, item);
  });
};

// TODO: Do more advanced checks.
// TODO: Check reserved list.
function checkLocationValidity(location) {
  if (!location || location.length === 0) {
    return 'no-location-given';
  }
  
  if (!/[a-zA-Z][a-zA-Z0-9.-]{3,32}/.test(location)) {
    return 'Location is invalid. Allowed characters are alphanumerics, “.”, and “-”.';
  }
  
  return null;
}

function createInDb(doc, callback) {
  app.db.projects.insert(doc, {w: 1}, function (err, project) {
    if (err) {
      if (err.code === 11000) {
        callback('project-exists-for-user');
      } else {
        callback('project-creation-error');
      }
      return;
    }
    
    callback(undefined, project);
  });
}

function createAndInitHead(project, callback) {
  headDir.getNewDir(function (path) {
    var update = {
      headPath: path
    };
    
    initHead(update, function (err) {
      if (err) return callback(err);
    
      app.db.projects.update({_id: project._id}, update, {w: 1}, function (err) {
        if (err) return callback(err);
        callback();
      });
    });
  });
}

function initHead(update, callback) {
  var initFile = __dirname + '/../data/latex/empty.tex';
  var mainFile = update.headPath + '/main.tex';
  util.copyFile(initFile, mainFile, function (err) {
    if (err) return callback(err);
    
    update.headFile = 'main.tex';
    update.headTree = {
      'main.tex': true
    };
    
    callback();    
  });
}
