function ProjectView(app) {
  this.app = app;
  this.elem = null;
  this.bar = null;
  this.title = null;
  this.tree = new TreeView();
}

ProjectView.prototype.setup = function (parent) {
  this.elem = createElement(parent);
  this.setupView();
  this.bar = createElement(this.elem);
  this.title = createElement(this.bar, 'h3');
  this.setupBar();
  this.tree.setup(this.elem);
  this.setupTree();
};

ProjectView.prototype.setupView = function () {
  var s = this.elem.style;
  s.height = '100%';
  s.width = '20%';
  s['float'] = 'left';
}

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
  
  var t = this.tree.container.add({path: '23r.text', label: 'wf2wef.text', isFile: false});
  this.tree.container.add({path: 'g4g.text', label: 'aswefwefdf.text'});
  this.tree.container.add({path: 'asdf.text', label: 'asdf.text'});
  t.container.add({path: '23r.text', label: 'wf2wef.text'});
  t.container.add({path: '23r.text', label: 'wf2wef.text'});
  t.container.add({path: '23r.text', label: 'wf2wef.text'});
};

ProjectView.prototype.itemClicked = function (item) {
  item.setSelected(true);
};

ProjectView.prototype.newFileClicked = function () {
};

ProjectView.prototype.uploadClicked = function () {
};

ProjectView.prototype.renameClicked = function () {
};

ProjectView.prototype.deleteClicked = function () {
};
