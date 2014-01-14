var util = require('./util');
var Pdf = require('./Pdf');

function OutputView(app) {
  this.app = app;
  this.elem = null;
  this.pdf = new Pdf(app);
}

OutputView.prototype.setup = function (parent, pos) {
  this.elem = util.createElement(parent, 'div', 'output-view');
  this.setupElem();
  this.pdf.setup(this.elem);
  this.realign(pos);
};

OutputView.prototype.setupElem = function () {
  var s = this.elem.style;
  s.height = '100%';
  s.cssFloat = 'left';
  s.overflow = 'auto';
  s.position = 'relative';
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

OutputView.prototype.getWidth = function () {
  return parseFloat(this.elem.style.width);
};

OutputView.prototype.onStopDrag = function () {
  this.pdf.redraw();
};

module.exports = OutputView;
