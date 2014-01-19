var commitMd = require('../models/commit');
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

function moveFiles(project, doc, callback) {
  var files = [];
  for (var i = 0, len = project.headFiles.length; i < len; i++) {
    files.push(project.headPath + '/' + project.headFiles[i]);
  }

  var head = project.headFiles[project.mainFile];
  var pdfFile = project.headPath + '/' +
    head.substring(0, head.length - 4) + '.pdf';

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
