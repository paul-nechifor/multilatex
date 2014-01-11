var projectLogic = require('../logic/project');
var userLogic = require('../logic/user');
var ProjectUploadHandler = require('../lib/ProjectUploadHandler');

var app = null;

exports.setApp = function (pApp) {
  app = pApp;
};

exports.checkAuth = function (req, res, next) {
  if (req.session.username) return next();
  res.json({ok: false, error: 'You need to be logged in.'});
};

exports.create = function (req, res) {
  userLogic.getUser(req.session.username, function (err, user) {
    if (err) return respond(res, err);

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
  delete req.session.username;
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

function respond(res, err) {
  if (err) {
    res.json({ok: false, error: err});
  } else {
    res.json({ok: true});
  }
}
