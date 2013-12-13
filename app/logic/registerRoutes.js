var api = require('../routes/api');
var root = require('../routes/root');
var user = require('../routes/user');

var userLogic = require('../logic/user');

function registerRoutes(app) {
  var e = app.express;
  
  api.setApp(app);
  user.setApp(app);
  
  userLogic.setApp(app);
  
  e.get('/', root.index);
  e.post('/api/login', api.login);
  e.post('/api/logout', api.logout);
  e.post('/api/register', api.register);
  e.get('/login', user.login);
  e.get('/password', user.password);
  e.get('/register', user.register);
  e.get('/:username', user.username);
  e.get('*', root.error404);
}

module.exports = registerRoutes;
