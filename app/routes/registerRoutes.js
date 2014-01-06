var express = require('express');

var api = require('../routes/api');
var blog = require('../routes/blog');
var project = require('../routes/project');
var root = require('../routes/root');
var user = require('../routes/user');

var fileStoreLogic = require('../logic/fileStore');
var headDirLogic = require('../logic/headDir');
var projectLogic = require('../logic/project');
var userLogic = require('../logic/user');

function registerRoutes(app) {
  var e = app.express;
  
  api.setApp(app);
  blog.setApp(app);
  project.setApp(app);
  user.setApp(app);
  
  fileStoreLogic.setApp(app);
  headDirLogic.setApp(app);
  projectLogic.setApp(app);
  userLogic.setApp(app);
  
  e.post('/api/create', api.checkAuth);
  e.get('/create', root.checkAuth);
  e.get('/:username/:location/edit', root.checkAuth);
  
  e.get('/', root.index);
  e.post('/api/create', api.create);
  e.post('/api/login', api.login);
  e.post('/api/logout', api.logout);
  e.post('/api/register', api.register);
  e.get('/blog', blog.index);
  e.get('/blog/:post', blog.post);
  e.get('/login', user.login);
  e.get('/password', user.password);
  e.get('/create', user.create);
  e.get('/register', user.register);
  e.get('/:username', user.username);
  e.get('/:username/:location', project.location);
  e.get('/:username/:location/edit', project.edit);
  e.get('/:username/:location/head/*', project.headFiles);
  e.get('*', root.error404);
}

module.exports = registerRoutes;
