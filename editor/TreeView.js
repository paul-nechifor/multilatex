var util = require('./util');

function TreeView() {
  this.elem = null;
  this.root = null;
  this.selectedItem = null;
  this.actions = {};
  // Files are referenced by their real ID, all other by negative fake ids.
  this.items = {};
  this.lastFakeId = -1;

  this.onClick = function (item) {};
}

TreeView.prototype.setup = function (parent, pos) {
  this.elem = util.createElement(parent, 'div', 'tree-view noselect');
  this.setupView(pos);
  this.setupRoot();
};

TreeView.prototype.setupView = function (pos) {
  this.realign(pos);
};

TreeView.prototype.realign = function (pos) {
  var s = this.elem.style;
  s.height = pos.horizRealWidth[0] + 'px';
};

TreeView.prototype.setupRoot = function () {
  var rootContainer = new TreeViewContainer(this, null);
  rootContainer.setup(this.elem);
  this.root = rootContainer.add({
    name: 'project-name',
    type: 'root'
  });
};

TreeView.prototype.addFile = function (path, id) {
  var parts = path.split('/');
  var item = this.root;
  for (var i = 0, len = parts.length; i < len; i++) {
    var name = parts[i];
    var type = (i === len - 1) ? 'file' : 'dir';
    var itemId = type === 'file' ? id : undefined;

    if (item.container.names[name]) {
      item = item.container.names[name];
    } else {
      this.addItem(item, name, type, itemId);
    }
  }
};

TreeView.prototype.addItem = function (parentItem, name, type, id) {
  var item = parentItem.container.add({
    id: type === 'file' ? id : this.lastFakeId--,
    name: name,
    type: type,
    actions: this.actions[type]
  });
  this.items[item.opts.id] = item;
};

TreeView.prototype.removeItem = function (item) {
  delete this.items[item.opts.id];
  item.parentContainer.removeChild(item);
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
    this.addFile(l[0], l[1]);
  }

  var mainItem = this.items[main];
  $(mainItem.elem).addClass('main');
};

function TreeViewContainer(tv, parentItem) {
  this.tv = tv;
  this.parentItem = parentItem;
  this.elem = null;
  this.dirs = [];
  this.nonDirs = [];
  this.names = {};
}

TreeViewContainer.prototype.setup = function (parent) {
  this.elem = util.createElement(parent, 'ul');
};

TreeViewContainer.prototype.add = function (opts) {
  if (opts.name in this.names) {
    throw new Error("That name exists.");
  }

  var item = new TreeViewItem(this.tv, this, opts);

  var li = document.createElement('li');
  var typeList = item.opts.type === 'dir' ? this.dirs : this.nonDirs;
  var index = this.getIndex(typeList, opts.name);
  item.index = index;

  if (index > 0 && index < typeList.length) {
    typeList.splice(index, 0, item);
    this.elem.insertBefore(li, typeList[index].elem);
  } else {
    typeList.push(item);
    if (item.opts.type === 'dir' && this.nonDirs.length > 0) {
      this.elem.insertBefore(li, this.nonDirs[0].elem);
    } else {
      this.elem.appendChild(li);
    }
  }

  this.names[item.opts.name] = item;

  item.setup(li);

  return item;
};

TreeViewContainer.prototype.removeChild = function (item) {
  $(item.elem).remove();
  delete this.names[item.opts.name];
  var typeList = item.opts.type === 'dir' ? this.dirs : this.nonDirs;
  typeList.splice(item.index, 1);
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

/*
 * The types are:
 *  - root: for the root;
 *  - dir: for directories (they have negative ids);
 *  - file: for actual files (they have positive ids);
 *  - marker: for file markers like subsection, tikzpicture and others.
 */
function TreeViewItem(tv, parentContainer, opts) {
  this.tv = tv;
  this.parentContainer = parentContainer;
  this.opts = opts;
  this.isSelected = false;
  this.collapsedState = 1;
  this.index = -1;

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
    if (this.opts.type === 'dir' || this.opts.type === 'root') {
      this.icon.setAttribute('class',
          TreeViewItem.COLLAPSED_STATES[this.collapsedState]);
    } else if (this.opts.type === 'file') {
      this.icon.setAttribute('class', 'glyphicon glyphicon-file');
    }
  }

  this.label = util.createElement(this.item, 'span');
  this.label.textContent = this.opts.name;

  this.container = new TreeViewContainer(this.tv, this);
  this.container.setup(this.elem);

  this.setupActions();
};

TreeViewItem.prototype.setupActions = function () {
  if (!this.opts.actions) {
    return;
  }

  var actionSet = util.createElement(this.item, 'span', 'actions');
  var that = this;

  var actionCall = function (action) {
    return function (e) {
      e.stopPropagation();
      action.func(that);
    };
  };

  for (var i = 0, len = this.opts.actions.length; i < len; i++) {
    var action = this.opts.actions[i];
    var a = util.createElement(actionSet, 'a');
    util.createElement(a, 'i', action.icon);
    $(a).tooltip({title: action.name, placement: 'bottom'});
    a.addEventListener('click', actionCall(action));
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
  if (this.opts.type === 'dir' || this.opts.type === 'root') {
    this.icon.setAttribute('class', TreeViewItem.COLLAPSED_STATES[state]);
  }
  this.container.elem.style.display = (state === 0) ? 'none' : 'block';
};

// TODO: Remove this. They should be immutable.
TreeViewItem.prototype.changeName = function (name) {
  this.opts.name = name;
  this.label.textContent = this.opts.name;
};

TreeViewItem.prototype.remove = function () {
  this.tv.removeItem(this);
};

module.exports = TreeView;
