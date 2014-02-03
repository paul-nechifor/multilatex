var util = require('./util');

function NotificationView(app) {
  this.app = app;
  this.elem = null;
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

module.exports = NotificationView;
