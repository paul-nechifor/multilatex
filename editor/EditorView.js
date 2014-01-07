var util = require('./util');

function EditorView(app) {
  this.app = app;
  this.elem = null;
  this.editor = null;
  this.file = null;
  this.shareJsDoc = null;
}

EditorView.prototype.setup = function (parent, pos) {
  this.elem = util.createElement(parent);
  this.editor = ace.edit(this.elem);
  this.setupElement(pos);
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
  this.editor.resize();
};

EditorView.prototype.setupEditor = function () {
  this.elem.style.fontSize = '14px';
  this.editor.setTheme('ace/theme/eclipse');
  this.editor.setReadOnly(true);

  var session = this.editor.getSession();
  session.setMode('ace/mode/latex');
  session.setUseWrapMode(true);
};

EditorView.prototype.setActiveFile = function (file) {
  this.file = file;

  this.editor.setReadOnly(false);

  var that = this;
  sharejs.open(this.file.shareJsId, 'text', function (err, doc) {
    that.shareJsDoc = doc;
    that.shareJsDoc.attach_ace(that.editor);
  });
};

EditorView.prototype.clearActiveFile = function () {
  this.file = null;
  this.shareJsDoc.detach_ace();
  this.editor.getSession().setValue('');
  this.editor.setReadOnly(true);
};

module.exports = EditorView;