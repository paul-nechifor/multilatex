var App = require('./lib/App');

function main() {
  var configPath = __dirname + '/../config/config.js';
  var config = require(configPath);
  
  var app = new App(config);
  app.start();
}

main();
