function EditorView(app) {
  this.app = app;
  this.elem = null;
  this.editor = null;
}

EditorView.prototype.setup = function (parent, pos) {
  this.elem = createElement(parent);
  this.setupElement(pos);
  this.editor = ace.edit(this.elem);
  this.setupEditor();
};

EditorView.prototype.setupElement = function (pos) {
  var s = this.elem.style;
  s.height = '100%';
  s.cssFloat = 'left';
  this.realign(pos);
};

EditorView.prototype.realign = function (pos) {
  var s = this.elem.style;
  s.width = pos.vertPaneRealWidth[1] + 'px';
};

EditorView.prototype.setWholeText = function (file) {
  this.editor.getSession().setValue(file);
};

EditorView.prototype.setupEditor = function () {
  this.editor.setTheme('ace/theme/eclipse');
  this.editor.getSession().setMode('ace/mode/latex');
  this.editor.getSession().on('change', function (e) {
    console.log(e);
  });
};
