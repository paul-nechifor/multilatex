var util = require('./util');

function TreeView() {
  this.elem = null;
  this.root = null;
  this.selectedItem = null;
  this.dirActions = null;
  this.fileActions = null;
  this.items = {};

  this.onClick = function (item) {};
}

TreeView.prototype.setup = function (parent) {
  this.elem = util.createElement(parent);
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

TreeView.prototype.addItem = function (id, path) {
  var parts = path.split('/');
  var item;
  var container = this.root.container;
  var i, len, name, isDir;
  for (i = 0, len = parts.length; i < len; i++) {
    name = parts[i];
    if (!(name in container.names)) {
      isDir = i < len - 1;
      item = container.add({
        id: id,
        name: name,
        isDir: isDir,
        actions: isDir ? this.dirActions : this.fileActions
      });
      this.items[id] = item;
      container = item.container;
    } else {
      container = container.names[name].container;
    }
  }
};

TreeView.prototype.fillWith = function (headFiles, main) {
  var list = [], i, len;

  for (i = 0, len = headFiles.length; i < len; i++) {
    var item = headFiles[i];
    if (item !== null) {
      list.push([item, i]);
    }
  }

  list.sort();

  for (i = 0, len = list.length; i < len; i++) {
    var l = list[i];
    this.addItem(l[1], l[0]);
  }

  var mainItem = this.items[main];
  $(mainItem.elem).addClass('main');
};

function TreeViewContainer(tv) {
  this.tv = tv;
  this.elem = null;
  this.dirs = [];
  this.files = [];
  this.names = {};
}

TreeViewContainer.prototype.setup = function (parent) {
  this.elem = util.createElement(parent, 'ul');
};

TreeViewContainer.prototype.add = function (opts) {
  if (opts.name in this.names) {
    throw new Error("That name exists.");
  }

  var item = new TreeViewItem(this.tv, opts);

  var li = document.createElement('li');
  var typeList = item.isDir ? this.dirs : this.files;
  var index = this.getIndex(typeList, opts.name);

  if (index > 0 && index < typeList.length) {
    typeList.splice(index, 0, item);
    this.elem.insertBefore(li, typeList[index].elem);
  } else {
    typeList.push(item);
    if (item.isDir && this.files.length > 0) {
      this.elem.insertBefore(li, this.files[0].elem);
    } else {
      this.elem.appendChild(li);
    }
  }

  this.names[item.name] = item;

  item.setup(li);

  return item;
};

TreeViewContainer.prototype.getIndex = function (typeList, newName) {
  var i = 0;
  var len = typeList.length;
  for (; i < len; i++) {
    if (typeList[i] >= newName) {
      break;
    }
  }
  return i;
};

TreeViewItem.COLLAPSED_STATES = [
  'glyphicon glyphicon-folder-close',
  'glyphicon glyphicon-folder-open'
];

function TreeViewItem(tv, opts) {
  this.tv = tv;
  this.isDir = opts.isDir || false;
  this.isSelected = false;
  this.collapsedState = 1;
  this.name = opts.name;
  this.opts = opts;

  this.elem = null;
  this.item = null;
  this.icon = null;
  this.label = null;
  this.container = null;
}

TreeViewItem.prototype.setup = function (elem) {
  this.elem = elem;

  this.item = util.createElement(this.elem, 'div', 'item');
  var that = this;
  this.item.addEventListener('click', function () {
    that.tv.onClick(that);
  });

  this.icon = util.createElement(this.item, 'i');
  if (this.opts.iconClass) {
    this.icon.setAttribute('class', this.opts.iconClass);
  } else {
    if (this.isDir) {
      this.icon.setAttribute('class',
                             TreeViewItem.COLLAPSED_STATES[this.collapsedState]);
    } else {
      this.icon.setAttribute('class', 'glyphicon glyphicon-file');
    }
  }

  this.label = util.createElement(this.item, 'span');
  this.label.innerText = this.name;

  if (this.isDir) {
    this.container = new TreeViewContainer(this.tv);
    this.container.setup(this.elem);
  }

  this.setupActions();
};

TreeViewItem.prototype.setupActions = function () {
  if (!this.opts.actions) {
    return;
  }

  var actionSet = util.createElement(this.item, 'span', 'actions');
  var that = this;

  for (var i = 0, len = this.opts.actions.length; i < len; i++) {
    var action = this.opts.actions[i];
    var a = util.createElement(actionSet, 'a');
    util.createElement(a, 'i', action.icon);
    $(a).tooltip({title: action.name, placement: 'bottom'});
    a.addEventListener('click', (function (action) {
      return function (e) {
        e.stopPropagation();
        action.func(that);
      };
    })(action));
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

TreeViewItem.prototype.collapse = function (state) {
  if (state === this.collapsedState) {
    return;
  }

  this.collapsedState = state;
  this.icon.setAttribute('class', TreeViewItem.COLLAPSED_STATES[state]);
  this.container.elem.style.display = (state === 0) ? 'none' : 'block';
};

TreeViewItem.prototype.changeName = function (name) {
  this.name = name;
  this.label.innerText = this.name;
};

module.exports = TreeView;
