var api = require('../routes/api');
var blog = require('../routes/blog');
var root = require('../routes/root');
var user = require('../routes/user');

var headDirLogic = require('../logic/headDir');
var projectLogic = require('../logic/project');
var userLogic = require('../logic/user');

function registerRoutes(app) {
  var e = app.express;
  
  api.setApp(app);
  blog.setApp(app);
  user.setApp(app);
  
  headDirLogic.setApp(app);
  projectLogic.setApp(app);
  userLogic.setApp(app);
  
  e.post('/api/create', api.checkAuth);
  e.get('/create', root.checkAuth);
  
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
  e.get('*', root.error404);
}

module.exports = registerRoutes;
