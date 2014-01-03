function ProjectView(app) {
  this.app = app;
  this.elem = null;
  this.bar = null;
  this.title = null;
  this.tree = new TreeView();
}

ProjectView.prototype.setup = function (parent, pos) {
  this.elem = createElement(parent, 'div', 'noselect');
  this.setupView(pos);
  this.bar = createElement(this.elem);
  this.title = createElement(this.bar, 'h3');
  this.setupBar();
  this.tree.setup(this.elem);
  this.setupTree();
};

ProjectView.prototype.setupView = function (pos) {
  var s = this.elem.style;
  s.height = '100%';
  s.cssFloat = 'left';
  this.realign(pos);
}

ProjectView.prototype.realign = function (pos) {
  var s = this.elem.style;
  
  if (pos.sepCollapsed[0]) {
    s.display = 'none';
  } else {
    s.display = 'block';
    s.width = pos.vertPaneRealWidth[0] + 'px';
  }
};

ProjectView.prototype.setupBar = function () {
  this.bar.setAttribute('class', 'project-bar');
  this.title.innerText = 'Project Name';
  
  var act = [
    ['plus-sign', this.newFileClicked.bind(this), 'New file'],
    ['upload', this.uploadClicked.bind(this), 'Upload'],
    ['pencil', this.renameClicked.bind(this), 'Rename'],
    ['trash', this.deleteClicked.bind(this), 'Delete'],
  ];
  
  var buttons = createElement(this.bar, 'span');
  
  for (var i = 0, len = act.length; i < len; i++) {
    var info = act[i];
    var a = createElement(buttons, 'a', 'btn btn-default');
    createElement(a, 'i', 'glyphicon glyphicon-' + info[0]);
    $(a).tooltip({title: info[2], placement: 'bottom'});
  }
};

ProjectView.prototype.setupTree = function () {
  this.tree.onClick = this.itemClicked.bind(this);
  var tree = {
    'a/b/c/d': true,
    'c/z/qq.tex': true,
    'c/dd': true,
    'a/b/d/qqqq': true
  };
  
  this.tree.fillWith(tree, 'c/dd');
};

ProjectView.prototype.itemClicked = function (item) {
  item.setSelected(true);
  if (item.isDir) {
    item.collapse(!item.isCollapsed);
  }
};

ProjectView.prototype.newFileClicked = function () {
};

ProjectView.prototype.uploadClicked = function () {
};

ProjectView.prototype.renameClicked = function () {
};

ProjectView.prototype.deleteClicked = function () {
};
