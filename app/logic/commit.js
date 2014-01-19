var commitMd = require('../models/commit');
var projectMd = require('../models/project');
var fileStore = require('../logic/fileStore');
var util = require('../logic/util');
var spawn = require('child_process').spawn;
var fs = require('fs');

var app = null;

exports.setApp = function (pApp) {
  app = pApp;
};

exports.commit = function (project, zipFile, callback) {
  commitMd.init(project, function (err, doc) {
    if (err) return callback(err);
    doc.zipFile = zipFile;
    moveFiles(project, doc, function (err) {
      if (err) return callback(err);
      createInDb(doc, callback);
    });
  });
};

exports.getCommitById = function (commitId, callback) {
  app.db.commits.findOne({_id: commitId}, callback);
};

exports.getInList = function (commitIds, callback) {
  var query = {_id: {$in: commitIds}};
  app.db.commits.find(query).toArray(callback);
};

exports.restoreCommit = function (doc, commit, callback) {
  createDirStructure(doc, commit, function (err) {
    if (err) return callback(err);
    copyFiles(doc, commit, function (err) {
      if (err) return callback(err);
      copyPdfFile(doc, commit, callback);
    });
  });
};

function copyFiles(doc, commit, callback) {
  var i = 0;
  var next = function () {
    if (i >= commit.files.length) return callback();

    var file = commit.files[i];
    if (file === null) { i++; return next(); }

    var from = fileStore.getPath(commit.hashes[i]);
    var to = doc.headPath + '/' + commit.files[i];
    util.copyFile(from, to, function (err) {
      if (err) return callback(err);
      i++;
      next();
    });
  };

  next();
}

function copyPdfFile(doc, commit, callback) {
  var from = fileStore.getPath(commit.pdfFile);
  var to = projectMd.getPdfFile(doc);
  util.copyFile(from, to, function (err) {
    if (err) return callback(err);
    callback();
  });
}

function moveFiles(project, doc, callback) {
  var files = [];
  for (var i = 0, len = project.headFiles.length; i < len; i++) {
    files.push(project.headPath + '/' + project.headFiles[i]);
  }

  var pdfFile = projectMd.getPdfFile(project);

  fileStore.storeAll(files, false, function (err, hashes) {
    if (err) return callback(err);

    doc.hashes = hashes;

    movePdf(pdfFile, function (err, hash) {
      if (err) return callback(); // No error, just the values not set.

      doc.pdfFile = hash;

      createThumbs(pdfFile, function (err, thumbs) {
        if (err) return callback(err);
        doc.thumbs = thumbs;
        callback();
      });
    });
  });
}

function createInDb(doc, callback) {
  app.db.commits.insert(doc, {w: 1}, function (err, commit) {
    if (err) return callback(err);
    callback(undefined, commit[0]);
  });
}

function movePdf(pdfFile, callback) {
  fileStore.store(pdfFile, false, function (err, hash) {
    if (err) return callback(err);
    callback(undefined, hash);
  });
}

function createThumbs(pdfFile, callback) {
  util.getTmpDir(function (err, path) {
    if (err) return callback(err);

    var pageFormat = path + '/p%05d.png';
    var args = ['-geometry', ''+app.config.thumbSize, pdfFile, pageFormat];
    var child = spawn('convert', args);
    child.on('close', function (code) {
      if (code !== 0) return callback('convert-code-' + code);

      fs.readdir(path, function (err, files) {
        if (err) return callback(err);
        var abs = files.sort().map(function (file) {return path + '/' + file;});

        fileStore.storeAll(abs, true, function (err, hashes) {
          if (err) return callback(err);

          fs.rmdir(path, function (err) {
            if (err) return callback(err);
            callback(undefined, hashes);
          });
        });
      });
    });
  });
}

function createDirStructure(doc, commit, callback) {
  var dirs = {};

  for (var i = 0, len = commit.files.length; i < len; i++) {
    var file = commit.files[i];
    if (file === null) {
      continue;
    }
    var parts = commit.files[i].split('/');
    parts.pop();
    var dir = parts.join('/');
    if (dir === '') {
      continue;
    }
    dirs[dir] = true;
  }

  var args = ['-p'];

  for (var dir in dirs) {
    args.push(dir);
  }

  // No dirs to create.
  if (args.length === 1) return callback();

  try {
    process.chdir(doc.headPath);
  } catch (err) {
    return callback(err);
  }

  var child = spawn('mkdir', args);
  child.on('close', function (code) {
    if (code !== 0) return callback('mkdir-code-' + code);
  });
}
