var util = require('./util');

function NotificationView(app) {
  this.app = app;
  this.elem = null;
  this.list = [];
}

NotificationView.prototype.setup = function (parent, pos) {
  this.elem = util.createElement(parent);
  this.setupView(pos);
};

NotificationView.prototype.setupView = function (pos) {
  this.realign(pos);
};

NotificationView.prototype.realign = function (pos) {
  var s = this.elem.style;
  s.height = pos.horizRealWidth[1] + 'px';
};

NotificationView.prototype.addAll = function (list) {
  for (var i = 0, len = list.length; i < len; i++) {
    this.add(list[i]);
  }
};

NotificationView.prototype.add = function (msg) {
};

module.exports = NotificationView;
