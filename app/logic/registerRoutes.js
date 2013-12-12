var api = require('../routes/api');
var index = require('../routes/index');
var user = require('../routes/user');

function registerRoutes(app) {
  var e = app.express;
  
  api.setApp(app);
  user.setApp(app);
  
  e.get('/', index.index);
  e.get('/api/login', api.login);
  e.get('/api/logout', api.logout);
  e.get('/api/register', api.register);
  e.get('/login', user.login);
  e.get('/password', user.password);
  e.get('/register', user.register);
  e.get('/:username', user.username);
}

module.exports = registerRoutes;
