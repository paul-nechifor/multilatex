var commitMd = require('../models/commit');
var projectLogic = require('../logic/project');
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

      createInDb(doc, function (err, commit) {
        if (err) return callback(err);

        projectLogic.updateOnCommit(commit, function (err) {
          if (err) return callback(err);
          callback(undefined, commit);
        });
      });
    });
  });
};

function moveFiles(project, doc, callback) {
  var tree = {};
  var unstored = [];

  for (var path in project.headTree) {
    var value = project.headTree[path];
    if (typeof value === 'string') {
      tree[path] = value;
    } else {
      unstored.push(project.headPath + '/' + path);
    }
  }

  fileStore.moveFiles(unstored, function (err, res) {
    if (err) return callback(err);

    for (var path in res) {
      tree[path] = res[path];
    }

    doc.headTree = tree;

    movePdf(project, function (err, hash) {
      if (!err) {
        doc.pdfFile = hash;
      }
      callback();
    });
  });
}

function createInDb(doc, callback) {
  app.db.projects.insert(doc, {w: 1}, function (err, commit) {
    if (err) return callback(err);
    callback(undefined, commit[0]);
  });
}

function movePdf(project, callback) {
  var path = project.headPath + '/';
  path += project.headFile.substring(0, project.headFile.length - 4) + '.pdf';

  fileStore.moveFile(path, function (err, hash) {
    if (err) return callback(err);
    callback(undefined, hash);
  });
}