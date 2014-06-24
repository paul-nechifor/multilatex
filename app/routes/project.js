var commitLogic = require('../logic/commit');
var projectLogic = require('../logic/project');
var userLogic = require('../logic/user');
var fileStore = require('../logic/fileStore');
var util = require('../logic/util');
var projectMd = require('../models/project');
var root = require('./root');
var ObjectID = require('mongodb').ObjectID;

var app = null;

var tabs = [
  ['overview', 'Overview', null, 'film'],
  ['history', 'History', '?tab=history', 'time']
];

var tabFuncs = {
  'overview': projectOverview,
  'history': projectHistory
};

exports.setApp = function (pApp) {
  app = pApp;
};

exports.location = function (req, res) {
  getProjectDataNoErr(req, res, function (user, project) {
    var activeTab =  tabFuncs[req.query.tab] ? req.query.tab : 'overview';
    var data = {
      p: project,
      tabs: tabs,
      activeTab: activeTab
    };

    tabFuncs[activeTab](req, res, data);
  });
};

exports.commit = function (req, res) {
  var n = parseInt(req.params.n, 10);
  if (isNaN(n)) return root.error404(req, res);

  getProjectDataNoErrCommit(req, res, n, function (user, project, commit) {
    res.render('commit', {p: project, c: commit});
  });
};

exports.commitFork = function (req, res) {
  root.error404(req, res);
};

exports.commitPdf = function (req, res) {
  var n = parseInt(req.params.n, 10);
  if (isNaN(n)) return root.error404(req, res);

  servePdf(req, res, n);
};

exports.commitView = function (req, res) {
  var n = parseInt(req.params.n, 10);
  if (isNaN(n)) return root.error404(req, res);

  getProjectDataNoErrCommit(req, res, n, function (user, project, commit) {
    var file = req.param(0);
    var id = getPathId(commit.files, file);
    if (id === -1) return root.error404(req, res);
    var hash = commit.hashes[id];

    fileStore.getTextFile(hash, file, function (err, fileType, fileData) {
      if (err) root.error500(req, res, err);
      res.render('view', {
        p: project,
        c: commit,
        fileId: id,
        fileType: fileType,
        fileData: fileData
      });
    });
  });
};

exports.commitZip = function (req, res) {
  var n = parseInt(req.params.n, 10);
  if (isNaN(n)) return root.error404(req, res);

  serveZip(req, res, n);
};

exports.edit = function (req, res) {
  getProjectDataNoErrContrib(req, res, function (user, project) {
    var data = {
      project: project
    };

    res.render('editor', data);
  });
};

exports.fork = function (req, res) {
  getProjectDataNoErrCommit(req, res, -1, function (user, project, commit) {
    var uid = req.session.userId;
    var name = req.session.username;
    projectLogic.fork(uid, name, user, project, commit, function (err, p) {
      if (err) return root.error500(req, res, err);
      res.redirect('/' + p.username + '/' + p.location);
    });
  });
};

exports.head = function (req, res) {
  var action = req.query.action;

  getProjectDataNoErrContrib(req, res, function (user, project) {
    if (action === 'download') {
      downloadHead(req, res, project);
      return;
    }

    // TODO: Implement rest.
    root.error404(req, res);
  });
};

exports.headPdf = function (req, res) {
  getProjectDataNoErrContrib(req, res, function (user, project) {
    serveHeadFile(req, res, projectMd.getPdfFileHead(project), project);
  });
};

exports.headLog = function (req, res) {
  getProjectDataNoErrContrib(req, res, function (user, project) {
    serveHeadFile(req, res, projectMd.getLogFileHead(project), project);
  });
};

exports.headFiles = function (req, res) {
  var file = req.param(0);

  getProjectDataNoErrContrib(req, res, function (user, project) {
    // TODO: This might need to be optimized.
    var list = project.headFiles;
    for (var i = 0, len = list.length; i < len; i++) {
      if (list[i] === file) return serveHeadFile(req, res, file, project);
    }

    root.error404(req, res);
  });
};

exports.pdf = function (req, res) {
  servePdf(req, res, -1);
};

exports.zip = function (req, res) {
  serveZip(req, res, -1);
};

function downloadHead(req, res, project) {
  projectLogic.createHeadArchive(project, function (err, hash) {
    if (err) return root.error500(req, res, err);
    res.setHeader('Content-disposition', 'attachment; filename=' +
        project.location + '.zip');
    serveStoreFile(req, res, hash);
  });
}

function servePdf(req, res, order) {
  getProjectDataNoErrCommit(req, res, order, function (user, project, commit) {
    if (commit.pdfFile === null) return root.error404(req, res);
    res.setHeader('Content-Type', 'application/pdf');
    serveStoreFile(req, res, commit.pdfFile);
  });
}

function serveZip(req, res, order) {
  getProjectDataNoErrCommit(req, res, order, function (user, project, commit) {
    var name = project.location;
    if (order >= 0) {
      name += '-commit-' + order;
    }
    name += '.zip';

    res.setHeader('Content-disposition', 'attachment; filename=' + name);
    serveStoreFile(req, res, commit.zipFile);
  });
}

function serveHeadFile(req, res, file, project) {
  util.pipeFile(project.headPath + '/' + file, res);
}

function serveStoreFile(req, res, hash) {
  var path = fileStore.getPath(hash);
  util.pipeFile(path, res);
}

function getProjectDataNoErrContrib(req, res, callback) {
  getProjectDataNoErr(req, res, function (user, project) {
    if (!(req.session.userId in project.contributorsIds)) {
      root.error403(req, res, 'not-a-contribuitor');
      return;
    }

    callback(user, project);
  });
}

function getProjectDataNoErrCommit(req, res, n, callback) {
  getProjectDataNoErr(req, res, function (user, project) {
    getCommitNoErr(req, res, project, n, function (commit) {
      callback(user, project, commit);
    });
  });
}

function getCommitNoErr(req, res, project, n, callback) {
  var commitIndex = n >= 0 ? n : (project.commits.length - 1);
  var commitId = project.commits[commitIndex];
  commitLogic.getCommitById(commitId, function (err, commit) {
    if (err) return root.error500(req, res, err);
    if (!commit) return root.error404(req, res);
    callback(commit);
  });
}

function getProjectDataNoErr(req, res, callback) {
  var username = req.params.username;
  var location = req.params.location;
  getProjectData(username, location, function (err, user, project) {
    if (err) return root.error500(req, res, err);
    if (!project) return root.error404(req, res);
    callback(user, project);
  });
}

function getProjectData(username, projectLocation, callback) {
  userLogic.getUser(username, function (err, user) {
    if (err) return callback(err);
    if (!user) return callback(undefined, null, null);

    projectLogic.getProject(user._id, projectLocation, function (err, project) {
      if (err) return callback(err);
      if (!project) return callback(undefined, null, null);
      callback(undefined, user, project);
    });
  });
}

function projectOverview(req, res, data) {
  getCommitNoErr(req, res, data.p, -1, function (commit) {
    data.c = commit;
    data.globalData = {projectId: data.p._id};
    res.render('projectOverview', data);
  });
}

function projectHistory(req, res, data) {
  commitLogic.getHistory(data.p.commits, function (err, commits) {
    if (err) return root.error500(req, res, err);
    decorateCommitWithAuthors(commits, function (err) {
      if (err) return root.error500(req, res, err);
      data.commits = commits;
      res.render('projectHistory', data);
    });
  });
}

function getPathId(files, file) {
  for (var i = 0, len = files.length; i < len; i++) {
    if (files[i] === file) {
      return i;
    }
  }
  return -1;
}

// TODO: Clean this up.
function decorateCommitWithAuthors(commits, callback) {
  // String id to object id.
  var ids = {};
  var map = function (m) { ids[m] = new ObjectID(m); };

  for (var i = 0, len = commits.length; i < len; i++) {
    Object.keys(commits[i].modders).map(map);
  }

  var idsList = [];
  for (var id in ids) {
    idsList.push(ids[id]);
  }

  userLogic.getUsersById(idsList, function (err, users) {
    if (err) return callback(err);

    var i, j, len, len2;

    var userMap = {};
    for (i = 0, len = users.length; i < len; i++) {
      userMap[users[i]._id] = users[i];
    }

    for (i = 0, len = commits.length; i < len; i++) {
      var modders = Object.keys(commits[i].modders);
      var authors = [];

      for (j = 0, len2 = modders.length; j < len2; j++) {
        var user = userMap[modders[j]];
        if (user !== undefined) {
          authors.push(user);
        }
      }

      commits[i].authors = authors;
    }

    callback();
  });
}
