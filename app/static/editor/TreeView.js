function TreeView() {
  this.elem = null;
  this.root = null;
  this.selectedItem = null;
  this.dirActions = null;
  this.fileActions = null;
  
  this.onClick = function (item) {};
}

TreeView.prototype.setup = function (parent) {
  this.elem = createElement(parent);
  this.elem.setAttribute('class', 'tree-view');
  
  this.setupRoot();
};

TreeView.prototype.setupRoot = function () {
  var rootContainer = new TreeViewContainer(this);
  rootContainer.setup(this.elem);
  this.root = rootContainer.add({
    name: 'project-name',
    isDir: true
  });
};

TreeView.prototype.addItem = function (path) {
  var parts = path.split('/');
  var item;
  var container = this.root.container;
  var i, len, name, isDir;
  for (i = 0, len = parts.length; i < len; i++) {
    name = parts[i];
    if (!(name in container.names)) {
      isDir = i < len - 1;
      item = container.add({
        name: name,
        isDir: isDir,
        actions: isDir ? this.dirActions : this.fileActions
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
  var container = this.root.container;
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
