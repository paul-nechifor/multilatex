var userLogic = require('../logic/user');

var app = null;

exports.setApp = function (pApp) {
  app = pApp;
  userLogic.setApp(app);
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
