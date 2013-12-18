var headDir = require('./headDir');
var util = require('./util');

var app = null;

exports.setApp = function (pApp) {
  app = pApp;
};

exports.create = function (doc, callback) {
  var err;
  
  err = checkLocationValidity(doc.location);
  if (err) {
    callback(err);
    return;
  }
  
  createInDb(doc, function (err, project) {
    if (err) {
      callback(err);
      return;
    }
    
    createAndInitHead(project, function (err) {
      if (err) {
        callback(err);
        return;
      }
    
      callback();
    });
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
    app.db.projects.update({_id: project._id}, update, {w: 1}, function (err) {
      if (err) {
        callback('database-project-update-error');
        return;
      }
      
      callback();
    });
  });
}
