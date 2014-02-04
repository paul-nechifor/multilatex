var util = require('./util');

function NotificationView(app) {
  this.app = app;
  this.elem = null;
  this.list = [];
  this.templates = {};
}

NotificationView.prototype.setup = function (parent, pos) {
  this.elem = util.createElement(parent);
  this.setupView(pos);
};

NotificationView.prototype.setupView = function (pos) {
  this.listElem = util.createElement(this.elem);
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
  var template = this.getTemplate(msg.type);
  if (!template) {
    console.err('No such template for:', msg);
    return;
  }

  var div = util.createElement(this.listElem, 'div', 'notif notif-' + msg.type);

  var html = template(msg);

  var $div = $(div);
  $div.html(html);

  if (msg.date) {
    var d = new Date(msg.date);
    var h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
    var time = h > 9 ? h : '0' + h;
    time += ':' + (m > 9 ? m : '0' + m);
    time += ':' + (s > 9 ? s : '0' + s);
    $div.prepend($('<div class="date"/>').text(time));
  }
};

NotificationView.prototype.getTemplate = function (type) {
  var template = this.templates[type];
  if (template) {
    return template;
  }

  var elem = $('#notif-' + type);
  if (!elem) {
    return null;
  }

  return _.template(elem.html());
};


module.exports = NotificationView;
