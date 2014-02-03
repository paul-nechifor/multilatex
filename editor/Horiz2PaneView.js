var util = require('./util');

function Horiz2PaneView(app, panes) {
  this.app = app;
  this.panes = panes;
  this.elem = null;
  this.sep = new HorizSepView(app);
}

Horiz2PaneView.prototype.setup = function (parent, pos) {
  this.elem = util.createElement(parent);
  this.setupView();
  this.setupChildren(pos);
  this.realign(pos);
};

Horiz2PaneView.prototype.setupView = function () {
  var s = this.elem.style;
  s.height = '100%';
};

Horiz2PaneView.prototype.setupChildren = function (pos) {
  this.panes[0].setup(this.elem, pos);
  this.sep.setup(this.elem, pos);
  this.panes[1].setup(this.elem, pos);
};

Horiz2PaneView.prototype.realign = function (pos) {
  for (var i = 0, len = this.panes.length; i < len; i++) {
    this.panes[i].realign(pos);
  }
};

function HorizSepView(app) {
  this.app = app;
}

HorizSepView.prototype.setup = function (parent, pos) {
  this.elem = util.createElement(parent, 'div', 'separator sep-horiz');
  this.setupView(pos);
};

HorizSepView.prototype.setupView = function (pos) {
  var s = this.elem.style;
  s.height = pos.sepSize + 'px';
};

module.exports = Horiz2PaneView;
