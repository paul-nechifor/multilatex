var fs = require('fs');

function genConfig() {
  var config = {
    cookieSecret: 'default secret',
    mongoUrl: 'mongodb://localhost:27017/multilatex',
    port: process.env.PORT || 3000
  };
  
  try {
    var file = fs.readFileSync(__dirname + '/secret.json');
    var json = JSON.parse(file);
    config.cookieSecret = json.cookieSecret;
  } catch (e) {
    console.warn('You should use a secret.');
  }
  
  return config;
}

module.exports = genConfig();