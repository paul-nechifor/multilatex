var util = require('../logic/util');
var exec = require('child_process').exec;

var MAIN_NAMES = {
  'main.tex': true,
  'project.tex': true,
  'doc.tex': true
};

function ProjectUploadHandler(files, dir) {
  this.files = files;
  this.dir = dir;
  this.callback = null;
  this.texFiles = null;
  this.name = 'untitled';
  this.headPath = null;
  this.headFiles = null;
  this.mainFile = -1;
}

ProjectUploadHandler.prototype.convert = function (callback) {
  this.callback = callback;

  var that = this;
  util.getNewHeadDir(function (err, path) {
    if (err) return that.fail(err);
    that.headPath = path;
    that.stepSplit();
  });
};

ProjectUploadHandler.prototype.stepSplit = function () {
  if (this.dir) return this.stepCopyDir();

  if (this.files[0].type === 'application/zip') {
    if (this.files.length > 1) return callback('too-many-zip-files');
    this.stepUnzip();
  } else {
    this.stepCopy();
  }
};

ProjectUploadHandler.prototype.stepCopyDir = function () {
  var that = this;
  // TODO: Use spawn, not exec.
  var commands = 'cd ' + that.headPath + ' && cp -r ' + this.dir + '/* .';

  exec(commands, function (err) {
    if (err) return that.fail(err);
    that.stepUnsplit();
  });
};

ProjectUploadHandler.prototype.stepUnzip = function () {
  var file = this.files[0];
  this.name = basename(file.name);

  var that = this;
  var commands = 'cd ' + that.headPath + ' && unzip ' + file.path;

  exec(commands, function (err) {
    if (err) return that.fail(err);
    that.stepUnsplit();
  });
};

ProjectUploadHandler.prototype.stepCopy = function () {
  this.fail('not-implemented');
};

ProjectUploadHandler.prototype.stepUnsplit = function () {
  var that = this;
  that.deleteUploaded(function () {
    that.files = null;
    that.stepIndexFiles();
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
  this.mainFile = getMainFileByName(this.headFiles);
  if (this.mainFile >= 0) return this.done();
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
  if (this.dir) return callback(); // Only uploaded files can be deleted.

  // TODO: Actually delete them.
  callback();
};

function getMainFileByName(files) {
  for (var i = 0, len = files.length; i < len; i++) {
    if (MAIN_NAMES[files[i].toLowerCase().trim()]) {
      return i;
    }
  }

  return -1;
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