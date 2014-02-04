var util = require('./util');
var TreeView = require('./TreeView');
var NotificationView = require('./NotificationView');
var Horiz2PaneView = require('./Horiz2PaneView');

var editableFiles = {
  'ind': true,
  'bbl': true,
  'bib': true,
  'tex': true,
  'toc': true,
  'cls': true,
  'def': true
};

function ProjectView(app) {
  this.app = app;
  this.elem = null;
  this.tree = new TreeView();
  this.notif = new NotificationView(app);
  this.paneView = new Horiz2PaneView(app, [this.tree, this.notif]);
}

ProjectView.prototype.setup = function (parent, pos) {
  this.elem = util.createElement(parent);
  this.setupView(pos);
  this.paneView.setup(this.elem, pos);
  this.setupTreeActions();
  this.setupTree();
};

ProjectView.prototype.setupView = function (pos) {
  var s = this.elem.style;
  s.height = '100%';
  s.cssFloat = 'left';
  this.realignSelf(pos);
};

ProjectView.prototype.realign = function (pos) {
  this.realignSelf(pos);
  this.notif.realign(pos);
  this.tree.realign(pos);
};

ProjectView.prototype.realignSelf = function (pos) {
  var s = this.elem.style;

  if (pos.sepCollapsed[0]) {
    s.display = 'none';
  } else {
    s.display = 'block';
    s.width = pos.vertPaneRealWidth[0] + 'px';
  }
};

ProjectView.prototype.setupTreeActions = function () {
  var rename = this.onRenameItem.bind(this);
  var delete_ = this.onDeleteItem.bind(this);
  var newFile = this.onNewFile.bind(this);
  var newFolder = this.onNewFolder.bind(this);
  var upload = this.onUploadHere.bind(this);

  var common = [
    {name: 'Rename', icon: 'glyphicon glyphicon-pencil', func: rename},
    {name: 'Delete', icon: 'glyphicon glyphicon-trash', func: delete_}
  ];

  this.tree.actions.dir = [
    {name: 'New file', icon: 'glyphicon glyphicon-plus-sign', func: newFile},
    {name: 'New folder', icon: 'glyphicon glyphicon-folder-close',
      func: newFolder},
    {name: 'Upload here', icon: 'glyphicon glyphicon-cloud-upload',
      func: upload},
    common[0],
    common[1]
  ];

  this.tree.actions.file = [common[0], common[1]];
};

ProjectView.prototype.setupTree = function () {
  this.tree.onClick = this.itemClicked.bind(this);
};

ProjectView.prototype.onStopDrag = function (separatorSide) {
};

ProjectView.prototype.itemClicked = function (item) {
  item.collapse((item.collapsedState + 1) % 2);

  if (item.opts.type !== 'file') {
    return;
  }

  var ext = item.opts.name.split('.');
  if (!editableFiles[ext[ext.length - 1].toLowerCase()]) {
    return;
  }

  this.app.project.loadFile(item.opts.id);
  this.removeSelection();
};

ProjectView.prototype.onRenameItem = function (item) {
};

ProjectView.prototype.onDeleteItem = function (item) {
  if (item.opts.type !== 'file') {
    return;
  }

  var that = this;
  var onBtn = function (index) {
    if (index === 0) {
      that.app.project.iDeleteFile(item);
    }
  };

  this.app.gui.modal.showMessage({
    title: 'Confim deletion',
    body: 'Are you sure you want to delete <strong>“' + item.opts.name +
        '”</strong>?',
    onBtn: onBtn
  });
};

ProjectView.prototype.onNewFile = function (parentItem) {
};

ProjectView.prototype.onNewFolder = function (parentItem) {
};

ProjectView.prototype.onUploadHere = function (parentItem) {
};

ProjectView.prototype.setSelected = function (fileId) {
  var item = this.tree.items[fileId];
  item.setSelected(true);
};

ProjectView.prototype.removeSelection = function () {
  if (this.tree.selectedItem) {
    this.tree.selectedItem.setSelected(false);
  }
};



module.exports = ProjectView;
