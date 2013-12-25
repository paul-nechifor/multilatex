function TreeViewContainer(tv) {
  this.tv = tv;
  this.elem = null;
  this.children = [];
}

TreeViewContainer.prototype.setup = function (parent) {
  this.elem = createElement(parent, 'ul');
};

TreeViewContainer.prototype.add = function (opts) {
  var item = new TreeViewItem(this.tv, opts);
  item.setup(this.elem);
  this.children.push(item);
  return item;
};
