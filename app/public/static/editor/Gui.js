function Gui(app, opts) {
  this.app = app;
  this.menu = new Menu(app, opts);
  this.workspace = new Workspace(app, opts);
}

Gui.prototype.setup = function () {
  this.menu.setup();
  this.workspace.setup();
};
