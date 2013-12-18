var identicon = require('identicon');
var fs = require('fs');

var fileStore = require('./fileStore');
var util = require('./util');

var app = null;

exports.setApp = function (pApp) {
  app = pApp;
};

exports.register = function (doc, callback) {
  var err;
  
  err = checkUsernameValidity(doc.username);
  if (err) {
    callback(err);
    return;
  }
  
  err = checkPasswordValidity(doc.password);
  if (err) {
    callback(err);
    return;
  }
  
  registerInDb(doc, function (err) {
    if (err) {
      callback(err);
      return;
    }
    
    callback();
  });
};

exports.login = function (username, password, callback) {
  checkAuth(username, password, function (err) {
    if (err) {
      callback(err);
      return;
    }
    
    callback();
  });
};

exports.getUser = function (username, callback) {
  app.db.users.findOne({username: username}, function (err, item) {
    if (err) {
      callback(err);
      return;
    }
    
    if (!item) {
      callback('user-not-found');
      return;
    }
    
    callback(undefined, item);
  });
};

// TODO: Do more advanced checks.
// TODO: Check reserved list.
function checkUsernameValidity(username) {
  if (!username || username.length === 0) {
    return 'no-username-given';
  }
  
  if (!/[a-zA-Z][a-zA-Z0-9.-]{3,32}/.test(username)) {
    return 'Username is invalid. Allowed characters are alphanumerics, “.”, and “-”.';
  }
  
  return null;
}

// TODO: Check in bad passwords.
function checkPasswordValidity(password) {
  if (typeof password !== 'string') {
    return 'No password';
  }
  
  return null;
}

function registerInDb(doc, callback) {
  doc.registered = Date.now();
  doc.passwordSha1 = util.sha1Sum(doc.password + doc.registered);
  
  generateIdenticon(doc, function (err, hash) {
    doc.avatarHash = hash;
    app.db.users.insert(doc, {w: 1}, function (err) {
      if (err) {
        if (err.code === 11000) {
          callback('Username exists.');
        } else {
          callback('Database error.');
        }
        return;
      }

      callback();
    });
  });
}

function checkAuth(username, password, callback) {
  app.db.users.findOne({username: username}, function (err, item) {
    if (err) {
      callback(err);
      return;
    }
    
    if (!item) {
      callback('Incorrect.');
      return;
    }
    
    var hash = util.sha1Sum(password + item.registered);
    
    if (item.passwordSha1 !== hash) {
      callback('Incorrect.');
      return;
    }
    
    callback();
  });
}

function generateIdenticon(doc, callback) {
  var avatarSize = app.config.avatarSize;
  identicon.generate(doc.username, avatarSize, function (err, buffer) {
    if (err) {
      callback(err);
      return;
    }
    
    util.getRandomFile(app.config.dirs.tmp, function (err, path) {
      if (err) {
        callback(err);
        return;
      }
      
      fs.writeFile(path, buffer, function (err) {
        if (err) {
          callback(err);
          return;
        }
        
        fileStore.moveFile(path, callback);
      });
    });
  });
}
