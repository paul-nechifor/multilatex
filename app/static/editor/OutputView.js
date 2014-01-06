function OutputView(app) {
  this.app = app;
  this.elem = null;
}

OutputView.prototype.setup = function (parent, pos) {
  this.elem = createElement(parent);

  var s = this.elem.style;
  s.height = '100%';
  s.cssFloat = 'left';
  this.realign(pos);
};

OutputView.prototype.realign = function (pos) {
  var s = this.elem.style;

  if (pos.sepCollapsed[1]) {
    s.display = 'none';
  } else {
    s.display = 'block';
    s.width = pos.vertPaneRealWidth[2] + 'px';
  }
};

OutputView.prototype.onBuildClicked = function () {
  this.app.project.build();
};
