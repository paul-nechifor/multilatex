function OutputView(app) {
  this.app = app;
  this.elem = null;
}

OutputView.prototype.setup = function (parent) {
  this.elem = createElement(parent);
  var s = this.elem.style;
  s.height = '100%';
  s.width = '40%';
  s['float'] = 'left';
};
