TreeViewItem.CLOSED = 'collapser glyphicon glyphicon-chevron-right';
TreeViewItem.OPEN = 'collapser glyphicon glyphicon-chevron-down';

function TreeViewItem(tv, opts) {
  this.tv = tv;
  this.isFile = opts.isFile === undefined ? true : false;
  this.isSelected = false;
  this.path = opts.path;
  this.opts = opts;
  
  this.elem = null;
  this.collapser = null;
  this.item = null;
  this.icon = null;
  this.label = null;
  this.container = null;
}

TreeViewItem.prototype.setup = function (parent) {
  this.elem = createElement(parent, 'li');
  
  this.item = createElement(this.elem);
  this.item.setAttribute('class', 'item');
  var that = this;
  this.item.addEventListener('click', function () {
    that.tv.onClick(that);
  });
  
  this.collapser = createElement(this.item, 'i');
  if (!this.isFile) {
    this.collapser.setAttribute('class', TreeViewItem.OPEN);
  } else {
    this.collapser.setAttribute('class', 'collapser');
  }
  
  this.icon = createElement(this.item, 'i');
  if (this.opts.iconClass) {
    this.icon.setAttribute('class', this.opts.iconClass);
  } else {
    if (this.isFile) {
      this.icon.setAttribute('class', 'glyphicon glyphicon-file');
    } else {
      this.icon.setAttribute('class', 'glyphicon glyphicon-folder-open');
    }
  }
  
  this.label = createElement(this.item, 'span');
  this.label.innerText = this.opts.label;
  
  if (!this.isFile) {
    this.container = new TreeViewContainer(this.tv);
    this.container.setup(this.elem);
  }
};

TreeViewItem.prototype.setSelected = function (select) {
  if ((select && this.isSelected) || (!select && !this.isSelected)) {
    return;
  }
  
  if (select) {
    if (this.tv.selectedItem) {
      this.tv.selectedItem.setSelected(false);
    }
    this.tv.selectedItem = this;
    this.isSelected = true;
    this.item.setAttribute('class', 'item selected');
  } else {
    this.tv.selectedItem = null;
    this.isSelected = false;
    this.item.setAttribute('class', 'item');
  }
};
