var projectLogic = require('../logic/project');
var userLogic = require('../logic/user');

var app = null;

exports.setApp = function (pApp) {
  app = pApp;
};

exports.checkAuth = function (req, res, next) {
  if (req.session.username) {
    next();
    return;
  }
  
  // TODO: Get the userId here so it won't be necessary on every API call.

  res.json({ok: false, error: 'You need to be logged in.'});
};

exports.create = function (req, res) {
  userLogic.getUser(req.session.username, function (err, user) {
    if (err) {
      respond(res, err);
      return;
    }
    
    var doc = {
      userId: user._id,
      location: req.body.location
    };
  
    projectLogic.create(doc, function (err) {
      if (err) {
        respond(res, err);
        return;
      }
      
      var location = '/' + req.session.username + '/' + doc.location;
      res.json({ok: true, createdLocation: location})
    });
  });
};

exports.login = function (req, res) {
  userLogic.login(req.body.username, req.body.password, function (err) {
    if (!err) {
      req.session.username = req.body.username;
    }
    
    respond(res, err);
  });
};

exports.logout = function (req, res) {
  delete req.session.username;
  res.json({ok: true});
};

exports.register = function (req, res) {
  var doc = {
    username: req.body.username,
    password: req.body.password
  };
  
  if (req.body.email) {
    doc.email = req.body.email;
  }
  
  userLogic.register(doc, function (err) {
    if (!err) {
      req.session.username = doc.username;
    }
    
    respond(res, err);
  });
};

function respond(res, err) {
  if (err) {
    res.json({ok: false, error: err});
  } else {
    res.json({ok: true});
  }
}
