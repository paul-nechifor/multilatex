function ActiveFile(project, fid) {
  this.project = project;
  this.fid = fid;
  this.shareJsId = encodeURIComponent(project.doc._id + ' ' + fid);
}

ActiveFile.prototype.load = function () {
  this.project.app.gui.editor.setActiveFile(this);
};

ActiveFile.prototype.close = function () {
};

module.exports = ActiveFile;
