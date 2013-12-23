function EditorView(app) {
  this.app = app;
  this.elem = null;
  this.editor = null;
}

EditorView.prototype.setup = function (parent) {
  this.elem = createElement(parent);
  this.setupElement();
  this.editor = ace.edit(this.elem);
  this.setupEditor();
};

EditorView.prototype.setupElement = function () {
  var s = this.elem.style;
  s.height = '100%';
  s.width = '40%';
  s['float'] = 'left';
};

EditorView.prototype.setupEditor = function () {
  this.editor.setTheme("ace/theme/monokai");
  this.editor.getSession().setMode("ace/mode/latex");
};
