var util = require('../logic/util');

exports.index = function (req, res) {
  res.render('index', {title: 'Multilatex'});
};

exports.error404 = function (req, res) {
  res.statusCode = 404;
  res.render('error404', {title: '404: Not Found'});
};

exports.error403 = function (req, res, msg) {
  res.statusCode = 403;
  res.render('error403', {title: '403: Forbidden', msg: msg});
};

exports.error500 = function (req, res, err) {
  res.statusCode = 500;
  res.render('error500', {title: '500: Server error'});
  util.logErr(err);
};

exports.checkAuth = function (req, res, next) {
  if (req.session.username) return next();
  req.session.cameFrom = req.url;
  res.redirect('/login');
};
