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

exports.getProject = function (userId, location, callback) {
  var query = {userId: userId, location: location};
  app.db.projects.findOne(query, function (err, item) {
    if (err) {
      callback(err);
      return;
    }
    
    if (!item) {
      callback('project-not-found');
      return;
    }
    
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
    
    initHead(path, function (err, headStruct) {
      if (err) {
        callback('error-creating-head');
        console.err(err);
      }
      update.headStruct = headStruct;
    
      app.db.projects.update({_id: project._id}, update, {w: 1}, function (err) {
        if (err) {
          callback('database-project-update-error');
          console.err(err);
          return;
        }

        callback();
      });
    });
  });
}

function initHead(headPath, callback) {
  var initFile = __dirname + '/../data/latex/empty.tex';
  var mainFile = headPath + '/main.tex';
  util.copyFile(initFile, mainFile, function (err) {
    if (err) {
      callback(err);
      return;
    }
    
    var headStruct = {
      main: 'main.tex',
      files: {
        'main.tex': true
      }
    };
    
    callback(undefined, headStruct);    
  });
}