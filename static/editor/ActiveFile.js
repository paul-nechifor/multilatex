function ActiveFile(project, path) {
  this.project = project;
  this.path = path;
  this.shareJsId = encodeURIComponent(project.doc._id + ' ' + path);
}

ActiveFile.prototype.load = function () {
  this.project.app.gui.editor.setActiveFile(this);
};

ActiveFile.prototype.close = function () {
};
