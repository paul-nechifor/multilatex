var headDir = require('./headDir');
var util = require('./util');
var projectMd = require('../models/project');
var ObjectID = require('mongodb').ObjectID;

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
  app.db.projects.findOne(query, function (err, project) {
    if (err) return callback(err);
    if (!project) return callback('project-not-found');
    project.headTree = fixHeadTreeFromMongo(project.headTree);
    callback(undefined, project);
  });
};

exports.getProjectById = function (projectIdStr, callback) {
  var query = {_id: new ObjectID(projectIdStr)};
  app.db.projects.findOne(query, function (err, project) {
    if (err) return callback(err);
    if (!project) return callback('project-not-found');
    project.headTree = fixHeadTreeFromMongo(project.headTree);
    callback(undefined, project);
  });
};

exports.getProjectsForUser = function (userId, callback) {
  // TODO: Use streaming and not toArray.
  app.db.projects.find({userId: userId}).toArray(callback);
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

    callback(undefined, project[0]);
  });
}

function createAndInitHead(project, callback) {
  headDir.getNewDir(function (path) {
    var updateDoc = {
      headPath: path
    };

    initHead(updateDoc, function (err) {
      if (err) return callback(err);
      var query = {_id: project._id};
      updateDoc.headTree = fixHeadTreeToMongo(updateDoc.headTree);
      var update = {$set: updateDoc};

      app.db.projects.update(query, update, {w: 1}, function (err, nUpdated) {
        if (err) return callback(err);
        callback();
      });
    });
  });
}

function initHead(updateDoc, callback) {
  var initFile = __dirname + '/../../data/latex/empty.tex';
  var mainFile = updateDoc.headPath + '/main.tex';
  util.copyFile(initFile, mainFile, function (err) {
    if (err) return callback(err);

    updateDoc.headFile = 'main.tex';
    updateDoc.headTree = {
      'main.tex': true
    };

    callback();
  });
}

function fixHeadTreeToMongo(headTree) {
  var ret = {};

  for (var item in headTree) {
    ret[item.replace(/\./g, '%')] = headTree[item];
  }
  
  return ret;
}

function fixHeadTreeFromMongo(headTree) {
  var ret = {};
  
  for (var item in headTree) {
    ret[item.replace(/%/g, '.')] = headTree[item];
  }
  
  return ret;
}
