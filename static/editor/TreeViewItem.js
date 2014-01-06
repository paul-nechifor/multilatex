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
  
  this.item = createElement(this.elem, 'div', 'item');
  var that = this;
  this.item.addEventListener('click', function () {
    that.tv.onClick(that);
  });
  
  this.icon = createElement(this.item, 'i');
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
  
  this.label = createElement(this.item, 'span');
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
  
  var actionSet = createElement(this.item, 'span', 'actions');
  var that = this;
  
  for (var i = 0, len = this.opts.actions.length; i < len; i++) {
    var action = this.opts.actions[i];
    var a = createElement(actionSet, 'a');
    createElement(a, 'i', action.icon);
    $(a).tooltip({title: action.name, placement: 'bottom'});
    a.addEventListener('click', (function (action) {
      return function (e) {
        e.stopPropagation();
        action.func(that);
      }
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
