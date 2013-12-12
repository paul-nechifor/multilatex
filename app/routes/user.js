var app = null;

exports.setApp = function (pApp) {
  app = pApp;
};

exports.login = function (req, res) {
  res.render('login', {title: 'Login'});
};

exports.password = function (req, res) {
  res.render('password', {title: 'Recover password'});
};

exports.register = function (req, res) {
  res.render('register', {title: 'Register'});
};

exports.username = function (req, res) {
  res.render('username', {});
};