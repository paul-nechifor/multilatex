function ProjectView(app) {
  this.app = app;
  this.elem = null;
}

ProjectView.prototype.setup = function (parent) {
  this.elem = createElement(parent);
  var s = this.elem.style;
  s.height = '100%';
  s.width = '20%';
  s['float'] = 'left';
};
