var fs = require('fs');

var name = 'multilatex';
var home = '/home/' + name;

var config = {
  cookieSecret: 'default secret',
  mongoUrl: 'mongodb://localhost:27017/multilatex',
  mongoDbName: 'multilatex',
  port: process.env.PORT || 3000,
  // The name of the user under which the node server will run.
  username: name,
  dirs: {
    home: home,
    install: home + '/apps/' + name,
    logs: home + '/logs',
    store: home + '/store',
    heads: home + '/heads',
    tmp: home + '/tmp',
    upload: home + '/upload'
  },
  // This is where the whole package is copied. After that, the install on that
  // system has to be updated.
  deploy: {
    work: 'work/multilatex',
    hostname: 'ubuntu@multilatex.com'
  },
  debug: true,
  avatarSize: 253,
  logger: ':date :remote-addr :method :url :status :response-time',
  fileLimit: 1024 * 1024
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