function Gui(app, opts) {
  this.app = app;
  this.menu = new Menu(app, opts);
  this.pos = new Positioning({
  });
  this.project = new ProjectView();
  this.editor = new EditorView();
  this.output = new OutputView();
  this.vert3PaneView = new Vert3PaneView(app, opts,
    [this.project, this.editor, this.output]);
}

Gui.prototype.setup = function () {
  this.menu.setup();
  
  var jWindow = $(window);
  this.pos.realign(jWindow.width(), jWindow.height());
  this.vert3PaneView.setup(this.pos);
  
  var that = this;
  window.onresize = function () {
    that.realign();
  };
};

Gui.prototype.realign = function () {
  var jWindow = $(window);
  this.pos.realign(jWindow.width(), jWindow.height());
  this.vert3PaneView.realign(this.pos);
};
