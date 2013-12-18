var fs = require('fs');

var config = {
  cookieSecret: 'default secret',
  mongoUrl: 'mongodb://localhost:27017/multilatex',
  mongoDbName: 'multilatex',
  port: process.env.PORT || 3000,
  // The name of the user under which the node server will run.
  username: 'multilatex',
  dirs: {
    home: '/home/multilatex',
    install: '/home/multilatex/apps/multilatex',
    logs: '/home/multilatex/logs',
    heads: '/home/multilatex/heads'
  },
  // This is where the whole package is copied. After that, the install on that
  // system has to be updated.
  deploy: {
    work: 'work/multilatex',
    hostname: 'ubuntu@multilatex.com'
  }
};

function genConfig() {
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