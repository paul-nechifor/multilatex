var identicon = require('identicon');
var fs = require('fs');

var fileStore = require('./fileStore');
var util = require('./util');
var userMd = require('../models/user');

var app = null;

exports.setApp = function (pApp) {
  app = pApp;
};

exports.register = function (opts, callback) {
  userMd.init(opts, function (err, doc) {
    if (err) return callback(err);

    registerInDb(opts, doc, function (err, user) {
      if (err) return callback(err);
      callback(undefined, user);
    });
  });
};

exports.login = function (username, password, callback) {
  checkAuth(username, password, function (err, user) {
    if (err) return callback(err);
    callback(undefined, user);
  });
};

exports.getUser = function (username, callback) {
  app.db.users.findOne({username: username}, callback);
};

function registerInDb(opts, doc, callback) {
  doc.passwordSha1 = util.sha1Sum(opts.password + doc.registered);

  generateIdenticon(doc, function (err, hash) {
    doc.avatarHash = hash;
    app.db.users.insert(doc, {w: 1}, function (err, items) {
      if (err) {
        if (err.code === 11000) {
          callback('username-exists');
        } else {
          callback('database-error');
          util.logErr(err);
        }
        if (!items || items.length === 0) {
          callback('nothing-inserted');
        }
        return;
      }

      callback(undefined, items[0]);
    });
  });
}

function checkAuth(username, password, callback) {
  app.db.users.findOne({username: username}, function (err, item) {
    if (err) return callback(err);
    if (!item) return callback('incorrect');

    var hash = util.sha1Sum(password + item.registered);

    if (item.passwordSha1 !== hash) return callback('incorrect');
    callback(undefined, item);
  });
}

function generateIdenticon(doc, callback) {
  var avatarSize = app.config.avatarSize;
  identicon.generate(doc.username, avatarSize, function (err, buffer) {
    if (err) return callback(err);

    util.getRandomFile(app.config.dirs.tmp, function (err, path) {
      if (err) return callback(err);

      fs.writeFile(path, buffer, function (err) {
        if (err) return callback(err);
        fileStore.store(path, true, callback);
      });
    });
  });
}
