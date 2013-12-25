function TreeView() {
  this.elem = null;
  this.container = new TreeViewContainer(this);
  this.selectedItem = null;
  
  this.onClick = function (item) {};
}

TreeView.prototype.setup = function (parent) {
  this.elem = createElement(parent);
  this.elem.setAttribute('class', 'tree-view');
  this.container.setup(this.elem);
};
