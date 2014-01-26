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
      checkFileDiffs(project, doc, function (err) {
        if (err) return callback(err);
        createInDb(doc, callback);
      });
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

exports.getHistory = function (commitIds, callback) {
  var query = {_id: {$in: commitIds}};
  app.db.commits.find(query).sort({_id: -1}).toArray(callback);
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

exports.getForProjects = function (projects, onlyValid, callback) {
  var mapping = {};
  var ids = [];

  for (var i = 0, len = projects.length; i < len; i++) {
    var p = projects[i];
    mapping[p._id] = { project: p };
    ids.push(p.commits[p.commits.length - 1]);
  }

  exports.getInList(ids, function (err, commits) {
    if (err) return callback(err);

    for (var i = 0, len = commits.length; i < len; i++) {
      var commit = commits[i];
      mapping[commit.projectId].project.commit = commit;
    }

    var ret = onlyValid ? trimInvalidProjects(mapping) : projects;
    callback(undefined, ret);
  });
};

function trimInvalidProjects(mapping) {
  var ret = [];

  for (var id in mapping) {
    var project = mapping[id].project;
    if (project.commit && project.commit.pdfFile !== null) {
      ret.push(project);
    }
  }

  return ret;
}

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
  var files = [], file;
  for (var i = 0, len = project.headFiles.length; i < len; i++) {
    file = project.headFiles[i];
    if (file !== null) {
      files.push(project.headPath + '/' + file);
    }
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

function checkFileDiffs(project, doc, callback) {
  if (doc.order === 0) {
    diffFirstCommit(project, doc, callback);
  } else {
    diffOtherCommit(project, doc, callback);
  }
}

function diffFirstCommit(project, doc, callback) {
  var mods = [];

  for (var i = 0, len = doc.files.length; i < len; i++) {
    mods.push([doc.files[i], i, 'a']);
  }

  mods.sort();
  doc.mods = mods.map(function (e) {e.shift(); return e;});

  callback();
}

function diffOtherCommit(project, doc, callback) {
  var prevId = project.commits[doc.order - 1];

  exports.getCommitById(prevId, function (err, prev) {
    if (err) return callback(err);
    if (!prev) return callback('no-commit');

    var files0 = prev.files;
    var files1 = doc.files;
    var hashes0 = prev.hashes;
    var hashes1 = doc.hashes;

    var mods = [];

    var i, len, len2, changed, moved;

    for (i = 0, len = files0.length; i < len; i++) {
      var name0 = files0[i];
      if (name0 === null) continue;
      var name1 = files1[i];
      if (name1 === null) {
        mods.push([name0, i, 'd', name0]);
        continue;
      }

      changed = hashes0[i] !== hashes1[i];
      moved = name0 !== name1;

      if (changed && moved) {
        mods.push([name1, i, 'cm', name0]);
      } else if (changed) {
        mods.push([name1, i, 'c']);
      } else if (moved) {
        mods.push([name1, i, 'm', name0]);
      }
    }

    for (i = len, len2 = files1.length; i < len2; i++) {
      mods.push([files1[i], i, 'a']);
    }

    mods.sort();
    doc.mods = mods.map(function (e) {e.shift(); return e;});

    callback();
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
