var MongoClient = require('mongodb').MongoClient;
var util = require('./util');

function Database(url) {
  this.url = url;
  this.db = null;
  
  this.users = null;
}

Database.prototype.connect = function (callback) {
  var that = this;
  MongoClient.connect(this.url, function(err, db) {
    if (err) {
      util.die('Could not connect to MongoDb. Is it open?');
    }

    that.db = db;

    that.users = that.db.collection('users');
    that.users.ensureIndex({'username': 1}, {unique: true, w: 1},
        function (err) {
      if (err) {
        // TODO: Startup errors usually end up crashing here with 'MongoError:
        // Connection Closed By Application' instead of where the exception
        // was thrown.
        // FIXIT
        util.die(err);
      }
    });

    callback();
  });
};

module.exports = Database;
