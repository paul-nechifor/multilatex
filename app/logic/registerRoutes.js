var api = require('../routes/api');
var root = require('../routes/root');
var user = require('../routes/user');

function registerRoutes(app) {
  var e = app.express;
  
  api.setApp(app);
  user.setApp(app);
  
  e.get('/', root.index);
  e.post('/api/login', api.login);
  e.post('/api/logout', api.logout);
  e.post('/api/register', api.register);
  e.get('/login', user.login);
  e.get('/password', user.password);
  e.get('/register', user.register);
  //e.get('/:username', user.username);
}

module.exports = registerRoutes;
