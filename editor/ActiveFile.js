function ActiveFile(project, fid) {
  this.project = project;
  this.fid = fid;
  this.shareJsId = encodeURIComponent(project.doc._id + ' ' + fid);
}

ActiveFile.prototype.load = function (callback) {
  this.project.app.gui.editor.setActiveFile(this, callback);
  this.project.app.gui.project.setSelected(this.fid);
};

ActiveFile.prototype.close = function () {
  this.project.app.gui.editor.clearActiveFile();
};

module.exports = ActiveFile;
