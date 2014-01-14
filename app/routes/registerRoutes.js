var express = require('express');

var api = require('../routes/api');
var blog = require('../routes/blog');
var project = require('../routes/project');
var root = require('../routes/root');
var user = require('../routes/user');

var commitLogic = require('../logic/commit');
var fileStoreLogic = require('../logic/fileStore');
var headDirLogic = require('../logic/headDir');
var projectLogic = require('../logic/project');
var userLogic = require('../logic/user');
var util = require('../logic/util');

function registerRoutes(app) {
  var e = app.express;

  api.setApp(app);
  blog.setApp(app);
  project.setApp(app);
  user.setApp(app);

  commitLogic.setApp(app);
  fileStoreLogic.setApp(app);
  headDirLogic.setApp(app);
  projectLogic.setApp(app);
  userLogic.setApp(app);
  util.setApp(app);

  e.post('/api/create', api.checkAuth);
  e.post('/api/upload', api.checkAuth);
  e.get('/create', root.checkAuth);
  e.get('/:username/:location/edit', root.checkAuth);

  e.get('/', root.index);
  e.post('/api/create', api.create);
  e.post('/api/login', api.login);
  e.post('/api/logout', api.logout);
  e.post('/api/register', api.register);
  e.post('/api/upload', api.upload);
  e.get('/blog', blog.index);
  e.get('/blog/:post', blog.post);
  e.get('/login', user.login);
  e.get('/password', user.password);
  e.get('/create', user.create);
  e.get('/register', user.register);
  e.get('/:username', user.username);
  e.get('/:username/:location', project.location);
  e.get('/:username/:location/edit', project.edit);
  e.get('/:username/:location/head', project.head);
  e.get('/:username/:location/head/pdf', project.headPdf);
  e.get('/:username/:location/head/*', project.headFiles);
  e.get('/:username/:location/pdf', project.pdf);
  e.get('/:username/:location/zip', project.zip);
  e.get('*', root.error404);
}

module.exports = registerRoutes;
