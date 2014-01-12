var commitMd = require('../models/commit');
var fileStore = require('../logic/fileStore');

var app = null;

exports.setApp = function (pApp) {
  app = pApp;
};

exports.commit = function (project, callback) {
  commitMd.init(project, function (err, doc) {
    if (err) return callback(err);
    moveFiles(project, doc, function (err) {
      if (err) return callback(err);
      createInDb(doc, callback);
    });
  });
};

function moveFiles(project, doc, callback) {
  var files = [];
  for (var i = 0, len = project.headFiles.length; i < len; i++) {
    files.push(project.headPath + '/' + project.headFiles[i]);
  }

  fileStore.storeAll(files, true, function (err, hashes) {
    if (err) return callback(err);

    doc.hashes = hashes;

    movePdf(project, function (err, hash) {
      if (!err) {
        doc.pdfFile = hash;
      }
      callback();
    });
  });
}

function createInDb(doc, callback) {
  app.db.commits.insert(doc, {w: 1}, function (err, commit) {
    if (err) return callback(err);
    callback(undefined, commit[0]);
  });
}

function movePdf(project, callback) {
  var head = project.headFiles[project.mainFile];
  var path = project.headPath + '/' +
    head.substring(0, head.length - 4) + '.pdf';

  fileStore.store(path, false, function (err, hash) {
    if (err) return callback(err);
    callback(undefined, hash);
  });
}