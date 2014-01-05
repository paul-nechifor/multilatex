function ActiveFile(project, path) {
  this.project = project;
  this.path = path;
}

ActiveFile.prototype.load = function (data) {
  var file = data.join('\n');
  this.project.app.gui.editor.setWholeText(file);
};

ActiveFile.prototype.close = function () {
  
};
