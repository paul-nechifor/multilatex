var express = require('express');

//exports.blog = function (req, res, next) {
//};

exports.index = function (req, res) {
  res.render('index', {title: 'Multilatex'});
};
