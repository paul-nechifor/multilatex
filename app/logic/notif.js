var notifMd = require('../models/notif');

var app = null;

exports.setApp = function (pApp) {
  app = pApp;
};

exports.create = function (opts, callback) {
  var doc = notifMd.init(opts);
  createInDb(doc, function (err, notif) {
    if (err) return callback(err);
    callback(undefined, notif);
  });
};

exports.getNotifById = function (notifId, callback) {
  app.db.notifs.findOne({_id: notifId}, callback);
};

exports.addMsg = function (notifId, msg, callback) {
  var query = {_id: notifId};
  var update = {$push: {list: msg}};
  app.db.notifs.update(query, update, {w: 1}, callback);
};

function createInDb(doc, callback) {
  app.db.notifs.insert(doc, {w: 1}, function (err, notif) {
    if (err) return callback(err);
    callback(undefined, notif[0]);
  });
}
