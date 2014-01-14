var util = require('./util');

VertSepView.COL_CLASSES = [
  'collapser col-left',
  'collapser col-right'
];

function VertSepView(index) {
  this.index = index;
  this.elem = null;
  this.colClass = this.index;
  this.isCollapsed = false;
  this.onCollapse = function () {};
  this.onDrag = function () {};
  this.onStopDrag = function () {};
}

VertSepView.prototype.setup = function (parent, pos) {
  this.elem = util.createElement(parent, 'div', 'separator sep-vert noselect');
  var s = this.elem.style;
  s.height = '100%';
  s.width = pos.sepSize + 'px';
  s.cssFloat = 'left';

  this.collapser = util.createElement(this.elem, 'div',
      VertSepView.COL_CLASSES[this.colClass]);
  util.createElement(this.collapser, 'div', 'arrow');

  this.collapse(pos.sepCollapsed[this.index]);

  this.setupListeners();
};

VertSepView.prototype.setupListeners = function () {
  var that = this;

  this.collapser.addEventListener('click', function (e) {
    e.stopPropagation();
    that.onCollapse(that.index);
  });

  this.elem.addEventListener('mousedown', function (e) {
    var pageX = e.pageX;
    var html = document.documentElement;

    var onMouseMove = function (e) {
      var dx = e.pageX - pageX;
      if (!dx) {
        return;
      }
      that.onDrag(that.index, dx);
      pageX = e.pageX;
    };
    var onMouseUp = function (e) {
      html.removeEventListener('mousemove', onMouseMove);
      html.removeEventListener('mouseup', onMouseUp);
      that.onStopDrag(that.index);
    };

    html.addEventListener('mousemove', onMouseMove);
    html.addEventListener('mouseup', onMouseUp);
  });
};

VertSepView.prototype.realign = function (pos) {
};

VertSepView.prototype.collapse = function (collapse) {
  if ((collapse && this.isCollapsed) || (!collapse && !this.isCollapsed)) {
    return;
  }

  this.isCollapsed = collapse;

  if (collapse) {
    this.colClass = (this.index + 1) % 2;
  } else {
    this.colClass = this.index;
  }

  this.collapser.setAttribute('class', VertSepView.COL_CLASSES[this.colClass]);
};

module.exports = VertSepView;
