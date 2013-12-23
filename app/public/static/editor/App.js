function App(opts) {
  this.gui = new Gui(this, opts);
}

App.prototype.load = function () {
  this.gui.setup();
};
