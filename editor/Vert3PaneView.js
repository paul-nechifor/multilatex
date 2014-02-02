var VertSepView = require('./VertSepView');

function Vert3PaneView(app, opts, threePanes) {
  this.app = app;
  this.elem = opts.workspaceElem;
  this.panes = threePanes;
  this.seps = [new VertSepView(0), new VertSepView(1)];
  this.order = [
    this.panes[0],
    this.seps[0],
    this.panes[1],
    this.seps[1],
    this.panes[2]
  ];
}

Vert3PaneView.prototype.setup = function (pos) {
  var s = this.elem.style;
  s.position = 'fixed';
  s.width = '100%';
  s.height = '100%';

  for (var i = 0, len = this.order.length; i < len; i++) {
    this.order[i].setup(this.elem, pos);
  }

  this.setupListeners(pos);
};

Vert3PaneView.prototype.setupListeners = function (pos) {
  var that = this;

  var onCollapse = function (index) {
    var sep = that.seps[index];
    sep.collapse(!sep.isCollapsed);
    pos.onSepCollapse(index, sep.isCollapsed);
    pos.sepCollapsed[index] = sep.isCollapsed;
    that.app.gui.realign();
  };

  var onDrag = function (index, dx) {
    pos.onSepDrag(index, dx);
    that.app.gui.realign();
  };

  var onStopDrag = function (index) {
    that.panes[index].onStopDrag('right');
    if (index + 1 < that.panes.length) {
      that.panes[index + 1].onStopDrag('left');
    }
    pos.onSepStopDrag();
  };

  for (var i = 0; i < this.seps.length; i++) {
    this.seps[i].onCollapse = onCollapse;
    this.seps[i].onDrag = onDrag;
    this.seps[i].onStopDrag = onStopDrag;
  }
};

Vert3PaneView.prototype.realign = function (pos) {
  for (var i = 0, len = this.order.length; i < len; i++) {
    this.order[i].realign(pos);
  }
};

module.exports = Vert3PaneView;
