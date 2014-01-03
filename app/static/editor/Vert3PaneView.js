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
    this.panes[2],
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
    pos.sepCollapsed[index] = sep.isCollapsed;
    that.app.gui.realign();
  };

  var onDrag = function (index, dx) {
    var sep = that.seps[index];
    pos.dragPane(index, dx);
    that.app.gui.realign();
  };
  
  for (var i = 0; i < 2; i++) {
    this.seps[i].onCollapse = onCollapse;
    this.seps[i].onDrag = onDrag;
  }
};

Vert3PaneView.prototype.realign = function (pos) {
  for (var i = 0, len = this.order.length; i < len; i++) {
    this.order[i].realign(pos);
  }
};
