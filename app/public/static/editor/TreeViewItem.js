TreeViewItem.CLOSED = 'collapser glyphicon glyphicon-chevron-right';
TreeViewItem.OPEN = 'collapser glyphicon glyphicon-chevron-down';

function TreeViewItem(tv, opts) {
  this.tv = tv;
  this.isDir = opts.isDir || false;
  this.isSelected = false;
  this.isCollapsed = false;
  this.name = opts.name;
  this.opts = opts;
  
  this.elem = null;
  this.collapser = null;
  this.item = null;
  this.icon = null;
  this.label = null;
  this.container = null;
}

TreeViewItem.prototype.setup = function (elem) {
  this.elem = elem;
  
  this.item = createElement(this.elem, 'div', 'item');
  var that = this;
  this.item.addEventListener('click', function () {
    that.tv.onClick(that);
  });
  
  this.collapser = createElement(this.item, 'i');
  if (this.isDir) {
    this.collapser.setAttribute('class', TreeViewItem.OPEN);
  } else {
    this.collapser.setAttribute('class', 'collapser');
  }
  
  this.icon = createElement(this.item, 'i');
  if (this.opts.iconClass) {
    this.icon.setAttribute('class', this.opts.iconClass);
  } else {
    if (this.isDir) {
      this.icon.setAttribute('class', 'glyphicon glyphicon-folder-open');
    } else {
      this.icon.setAttribute('class', 'glyphicon glyphicon-file');
    }
  }
  
  this.label = createElement(this.item, 'span');
  this.label.innerText = this.opts.name;
  
  if (this.isDir) {
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

TreeViewItem.prototype.collapse = function (collapse) {
  if ((collapse && this.isCollapsed) || (!collapse && !this.isCollapsed)) {
    return;
  }
  
  this.isCollapsed = collapse;
  
  if (collapse) {
    this.container.elem.style.display = 'none';
    this.collapser.setAttribute('class', TreeViewItem.CLOSED);
  } else {
    this.container.elem.style.display = 'block';
    this.collapser.setAttribute('class', TreeViewItem.OPEN);
  }
};
