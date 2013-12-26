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

TreeView.prototype.addItem = function (path) {
  var parts = path.split('/');
  var item;
  var container = this.container;
  var i, len, name;
  for (i = 0, len = parts.length; i < len; i++) {
    name = parts[i];
    if (!(name in container.names)) {
      item = container.add({
        name: name,
        isDir: i < len - 1
      });
      container = item.container;
    } else {
      container = container.names[name].container;
    }
  }
};

TreeView.prototype.getItem = function (path) {
  var parts = path.split('/');
  var item;
  var container = this.container;
  for (var i = 0, len = parts.length; i < len; i++) {
    item = container.names[parts[i]];
    if (!item) {
      return null;
    }
    container = item.container;
  }
  return item;
};

TreeView.prototype.fillWith = function (pathSet, main) {
  var list = Object.keys(pathSet);
  list.sort();
  for (var i = 0, len = list.length; i < len; i++) {
    this.addItem(list[i]);
  }
  
  var mainItem = this.getItem(main);
  $(mainItem.elem).addClass('main');
};

