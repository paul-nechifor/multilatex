var util = require('./util');

function NotificationView(app) {
  this.app = app;
  this.elem = null;
  this.listElem = null;
  this.inputElem = null;
  this.list = [];
  this.templates = {};
}

NotificationView.prototype.setup = function (parent, pos) {
  this.elem = util.createElement(parent, 'div', 'notif-view');
  this.setupView(pos);
};

NotificationView.prototype.setupView = function (pos) {
  var anotherDiv = util.createElement(this.elem);
  this.listElem = util.createElement(anotherDiv);
  this.inputElem = util.createElement(this.elem, 'textarea', 'msg');
  this.inputElem.setAttribute('placeholder', 'type a message...');
  this.setupChat();
  this.realign(pos);
};

NotificationView.prototype.setupChat = function (pos) {
  var that = this;
  this.inputElem.addEventListener('keydown', function (e) {
    if (e.keyCode === 13) { // Enter.
      e.preventDefault();
      var $elem = $(that.inputElem);
      var text = $elem.val();
      $elem.val('');

      that.app.wss.sendMsg('chat', text);
    }
  });
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

  if (msg.type === 'chat') {
    this.checkExpressions($div);
  }
};

NotificationView.prototype.checkExpressions = function ($div) {
  var $span = $div.find('span.msg');
  var html = $span.html();

  var project = this.app.project;

  html = html.replace(/(\b[^ ]+):(\d+)/g, function (match, file, line) {
    var lineNo = Number(line);
    var fileId = project.findFileId(file);
    if (fileId === -1) {
      return match;
    }

    return '<a href="javascript:gotoFileLine(' + fileId + ', ' + lineNo +
        ')">' + match + '</a>';
  });

  $span.html(html);
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
