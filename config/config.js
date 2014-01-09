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
    store: '/home/multilatex/store',
    heads: '/home/multilatex/heads',
    tmp: '/home/multilatex/tmp'
  },
  // This is where the whole package is copied. After that, the install on that
  // system has to be updated.
  deploy: {
    work: 'work/multilatex',
    hostname: 'ubuntu@multilatex.com'
  },
  debug: true,
  avatarSize: 253,
  logger: ':date :remote-addr :method :url :status :response-time'
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