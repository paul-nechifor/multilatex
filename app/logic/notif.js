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

function createInDb(doc, callback) {
  app.db.notifs.insert(doc, {w: 1}, function (err, notif) {
    if (err) return callback(err);
    callback(undefined, notif[0]);
  });
}
