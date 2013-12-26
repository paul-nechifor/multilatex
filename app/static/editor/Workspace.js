// Workspace will need to be highly configurable, but for now it will have three
// panes.

function Workspace(app, opts) {
  this.app = app;
  this.elem = opts.workspaceElem;
  this.project = new ProjectView();
  this.editor = new EditorView();
  this.output = new OutputView();
}

Workspace.prototype.setup = function () {
  var s = this.elem.style;
  s.position = 'fixed';
  s.width = '100%';
  s.height = '100%';
  this.project.setup(this.elem);
  this.editor.setup(this.elem);
  this.output.setup(this.elem);
};
