var express = require('express');
var http = require('http');
var path = require('path');
var MongoStore = require('connect-mongo')(express);
var sharejs = require('share');

var Database = require('./Database');
var Latex = require('./Latex');
var WebSocketServer = require('./WebSocketServer');
var registerRoutes = require('../routes/registerRoutes');

function App(config) {
  this.config = config;
  this.express = null;
  this.db = null;
  this.sessionStore = null;
  this.cookieParser = null;
  this.server = null;
  this.webSocketServer = new WebSocketServer(this);
  this.shareJs = null;
  this.latex = new Latex(this);
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
  this.webSocketServer.setup();
};

App.prototype.configure = function () {
  this.sessionStore = new MongoStore({db: this.config.mongoDbName});
  this.cookieParser = express.cookieParser(this.config.cookieSecret);
  // all environments
  this.express.set('views', __dirname + '/../views');
  this.express.set('view engine', 'jade');
  this.express.use(express.compress());
  this.express.use(express.logger('dev'));
  this.express.use(express.json());
  this.express.use(express.urlencoded());
  this.express.use(express.methodOverride());
  this.express.use(this.cookieParser);
  this.express.use(express.session({
    secret: this.config.cookieSecret,
    store: this.sessionStore
  }));
  this.express.use(require('./jadeLocals.js'));
  this.express.use('/s', require('stylus').middleware(__dirname + '/../static'));
  this.express.use('/s', express['static'](__dirname + '/../static'));
  this.express.use('/store', express['static'](this.config.dirs.store));
  this.configureShareJs();
  this.express.use(this.express.router);

  // development only
  if ('development' == this.express.get('env')) {
    this.express.use(express.errorHandler());
  }
};

App.prototype.configureShareJs = function () {
  var shareOpt = {
    db: {type: 'none'}
  };
  sharejs.server.attach(this.express, shareOpt);
  this.shareJs = this.express.model;
};

App.prototype.registerRoutes = function () {
  registerRoutes(this);
};

App.prototype.createServer = function () {
  this.server = http.createServer(this.express);
  this.server.listen(this.config.port);
};

App.prototype.getReqSession = function (req, callback) {
  var that = this;
  
  this.cookieParser(req, null, function (err) {
    if (err) return callback(err);
    
    var sessionId = req.signedCookies['connect.sid'];
    that.sessionStore.get(sessionId, function (err, session) {
      if (err) return callback(err);
      callback(undefined, session);
    });
  });
};

module.exports = App;
