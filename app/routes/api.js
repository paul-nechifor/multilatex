var projectLogic = require('../logic/project');
var userLogic = require('../logic/user');
var util = require('../logic/util');
var ProjectUploadHandler = require('../lib/ProjectUploadHandler');

var app = null;

exports.setApp = function (pApp) {
  app = pApp;
};

exports.checkAuth = function (req, res, next) {
  if (req.session.username) return next();
  res.json({ok: false, error: 'You need to be logged in.'});
};

exports.contributors = function (req, res) {
  var action = req.body.action;

  projectLogic.getProjectById(req.body.projectId, function (err, project) {
    if (err) return respond(res, err);
    if (!project) return respond(res, 'user-not-found');
    if (!project.contributorsIds[req.session.userId.toString()]) {
      return respond(res, 'not-a-contributor');
    }

    var end = function (err, softErr) {
      if (err) {
        util.logErr(err);
        respond(res, 'update-error');
        return;
      }
      respond(res, softErr);
    };

    if (action === 'remove') {
      removeContrib(project, req.session.userId, req.body.userId, end);
    } else if (action === 'add') {
      addContrib(project, req.session.userId, req.body.username, end);
    } else {
      respond(res, 'invalid-action');
    }
  });
};

exports.create = function (req, res) {
  userLogic.getUser(req.session.username, function (err, user) {
    if (err) return respond(res, err);
    if (!user) return respond(res, 'user-not-found');

    var opts = {
      username: req.session.username,
      userId: user._id,
      location: req.body.location
    };

    projectLogic.create(opts, function (err, project) {
      if (err) return respond(res, err);
      var location = '/' + req.session.username + '/' + opts.location;
      res.json({ok: true, createdLocation: location});
    });
  });
};

exports.login = function (req, res) {
  userLogic.login(req.body.username, req.body.password, function (err, user) {
    if (!err) {
      req.session.username = req.body.username;
      req.session.userId = user._id;
    }

    respond(res, err);
  });
};

exports.logout = function (req, res) {
  req.session.destroy();
  res.json({ok: true});
};

exports.register = function (req, res) {
  var opts = {
    username: req.body.username,
    password: req.body.password
  };

  if (req.body.email) {
    opts.email = req.body.email;
  }

  userLogic.register(opts, function (err, user) {
    if (!err) {
      req.session.username = user.username;
      req.session.userId = user._id;
    }

    respond(res, err);
  });
};

exports.upload = function (req, res) {
  var puh = new ProjectUploadHandler(req.files.files);
  puh.convert(function (err) {
    if (err) return res.json({ok: false, error: err});

    var u = req.session.username, uid = req.session.userId;
    projectLogic.createFrom(u, uid, puh, function (err, project) {
      if (err) return res.json({ok: false, error: err});
      var location = '/' + project.username + '/' + project.location;
      res.json({ok: true, createdLocation: location});
    });
  });
};

// No need to check if a user exists in order to remove him.
function removeContrib(project, authorId, userIdStr, callback) {
  var names = project.contributors;
  var ids = project.contributorsIds;

  for (var name in names) {
    if (names[name] === userIdStr) {
      delete names[name];
      return;
    }
  }

  delete ids[userIdStr];

  var query = {_id: project._id};
  var update = {$set: {contributors: names, contributorsIds: ids}};
  app.db.projects.update(query, update, {w: 1}, function (err) {
    callback(err);
  });

  // TODO: Notify the editor.

  // TODO: Log who removed whom.
}

function addContrib(project, authorId, username, callback) {
  userLogic.getUser(username, function (err, user) {
    if (err) return callback(err);
    if (!user) return callback(undefined, 'no-such-user');

    var names = project.contributors;
    var ids = project.contributorsIds;

    names[user.username] = Date.now();
    ids[user._id.toString()] = username;

    var query = {_id: project._id};
    var update = {$set: {contributors: names, contributorsIds: ids}};
    app.db.projects.update(query, update, {w: 1}, function (err) {
      callback(err);
    });
  });

  // TODO: Log who added whom.
}

function respond(res, err) {
  if (err) {
    res.json({ok: false, error: err});
  } else {
    res.json({ok: true});
  }
}
