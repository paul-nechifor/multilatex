var express = require('express');
var http = require('http');
var path = require('path');

var index = require('../routes/index');

var Database = require('./Database');

function App(config) {
  this.config = config;
  this.express = null;
  this.db = null;
  this.server = null;
}

App.prototype.start = function () {
  this.db = new Database(this.config.mongoUrl);
  this.express = express();
  
  this.db.connect(this.startStep2.bind(this));
};

App.prototype.startStep2 = function () {
  this.configure();
  this.registerRoutes();
  this.createServer();
};

App.prototype.configure = function () {
  // all environments
  this.express.set('views', __dirname + '/../views');
  this.express.set('view engine', 'jade');
  this.express.use(express.compress());
  this.express.use(express.favicon());
  this.express.use(express.logger('dev'));
  this.express.use(express.json());
  this.express.use(express.urlencoded());
  this.express.use(express.methodOverride());
  this.express.use(express.cookieParser(this.config.cookieSecret));
  this.express.use(express.session());
  this.express.use(require('./jadeLocals.js'));
  this.express.use(this.express.router);
  this.express.use(require('stylus').middleware(__dirname + '/../public'));
  this.express.use(express.static(__dirname + '/../public'));

  // development only
  if ('development' == this.express.get('env')) {
    this.express.use(express.errorHandler());
  }
};

App.prototype.registerRoutes = function () {
  this.express.get('/', index.index);
};

App.prototype.createServer = function () {
  this.server = http.createServer(this.express);
  this.server.listen(this.config.port);
};

module.exports = App;
