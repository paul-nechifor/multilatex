function Prefs(app, vals) {
  this.app = app;
  this.vals = vals;
  this.changed = {};
  this.listeners = {};
}

Prefs.prototype.set = function (vals) {
  for (var key in vals) {
    if (this.vals[key] !== undefined) {
      this.vals[key] = this.changed[key] = vals[key];
    }
  }
  for (var key in vals) {
    if (this.vals[key] === undefined) {
      continue;
    }
    var list = this.listeners[key];
    if (!list) {
      continue;
    }
    var value = vals[key];
    for (var i = 0, len = list.length; i < len; i++) {
      list[i](value);
    }
  }
};

// TODO: Throttle sending the save message.
Prefs.prototype.save = function () {
  if (Object.keys(this.changed).length === 0) {
    return;
  }

  var changed = this.changed;
  this.changed = {};

  var that = this;
  this.app.wss.callMsg('savePrefs', changed, function (msg) {
    if (msg.error) return that.panic(msg.error);
  });
};

Prefs.prototype.loadUserDoc = function (callback) {
  var that = this;
  this.wss.callMsg('getUserDoc', 1, function (msg) {
    if (msg.error) return that.panic(msg.error);
    that.userDoc = msg.userDoc;
    callback();
  });
};

Prefs.prototype.listen = function (key, func) {
  if (this.vals[key] === undefined) {
    throw new Error('No such key.');
  }
  var list = this.listeners[key];
  if (list === undefined) {
    this.listeners[key] = [func];
  } else {
    list.push(func);
  }
};

Prefs.prototype.unlisten = function (vals) {
};

module.exports = Prefs;
