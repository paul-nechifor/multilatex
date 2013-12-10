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

    callback();
  });
};

module.exports = Database;
