var headDir = require('../logic/headDir');
var util = require('../logic/util');
var exec = require('child_process').exec;

var MAIN_NAMES = {
  'main.tex': true,
  'project.tex': true,
  'doc.tex': true
};

function ProjectUploadHandler(files) {
  this.files = files;
  this.name = null;
  this.callback = null;
  this.headPath = null;
  this.headFiles = null;
  this.texFiles = null;
  this.mainFile = null;
}

ProjectUploadHandler.prototype.convert = function (callback) {
  this.callback = callback;

  if (this.files[0].type === 'application/zip') {
    if (this.files.length > 1) return callback('too-many-zip-files');
    this.stepUnzip();
  } else {
    return callback('not-implemented');
  }
};

ProjectUploadHandler.prototype.stepUnzip = function () {
  var file = this.files[0];
  this.name = basename(file.name);
  var that = this;
  headDir.getNewDir(function (path) {
    that.headPath = path;
    var commands = 'cd ' + path + ' && unzip ' + file.path;
    exec(commands, function (err) {
      if (err) return that.fail(err);
      that.deleteUploaded(function () {
        if (err) return that.fail(err);
        that.files = null;
        that.stepIndexFiles();
      });
    });
  });
};

ProjectUploadHandler.prototype.stepIndexFiles = function () {
  var that = this;
  util.dirWalk(this.headPath, function (err, results) {
    if (err) return that.fail(err);
    that.headFiles = makeRelative(that.headPath, results);
    that.texFiles = getTexFilesExt(that.headFiles);
    if (that.texFiles.length === 0) return that.fail('no-tex-files');
    that.stepMainFile();
  });
};

ProjectUploadHandler.prototype.stepMainFile = function () {
  this.mainFile = getMainFileByName(this.texFiles);
  if (this.mainFile) return this.done();
  // TODO: Search in files for '\documentclass'.
  this.fail('no-main-tex-file');
};

ProjectUploadHandler.prototype.fail = function (err) {
  // TODO: Try to clean up everything.
  this.done(err);
};

ProjectUploadHandler.prototype.done = function (err) {
  var cb = this.callback;
  this.callback = null;
  cb(err);
};

ProjectUploadHandler.prototype.deleteUploaded = function (callback) {
  callback();
};

function getMainFileByName(files) {
  for (var i = 0, len = files.length; i < len; i++) {
    if (MAIN_NAMES[files[i].toLowerCase().trim()]) {
      return files[i];
    }
  }

  return null;
}

function getTexFilesExt(files) {
  var ret = [];
  for (var i = 0, len = files.length; i < len; i++) {
    var file = files[i], lower = file.toLowerCase();
    if (lower.indexOf('.tex', lower.length - 4) !== -1) {
      ret.push(file);
    }
  }
  return ret;
}

function makeRelative(dir, files) {
  return files.map(function (file) {
    return file.substring(dir.length + 1);
  });
}

function basename(file) {
  return file.substring(0, file.length - 4);
}

module.exports = ProjectUploadHandler;