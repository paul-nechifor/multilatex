var express = require('express');

exports.index = function (req, res) {
  res.render('index', {title: 'Multilatex'});
};

exports.error404 = function (req, res) {
  res.render('error404', {title: '404: Not Found'});
};

exports.error500 = function (req, res) {
  res.render('error500', {title: '500'});
};

exports.checkAuth = function (req, res, next) {
  if (req.session.username) {
    next();
    return;
  }

  req.session.cameFrom = req.url;
  res.redirect('/login');
};
