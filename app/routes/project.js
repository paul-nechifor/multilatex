var commitLogic = require('../logic/commit');
var projectLogic = require('../logic/project');
var userLogic = require('../logic/user');
var fileStore = require('../logic/fileStore');
var util = require('../logic/util');
var projectMd = require('../models/project');
var root = require('./root');

var app = null;

var tabs = [
  ['overview', 'Overview', null],
  ['history', 'History', '?tab=history']
];

var tabFuncs = {
  'overview': projectOverview,
  'history': projectHistory
};

exports.setApp = function (pApp) {
  app = pApp;
};

exports.location = function (req, res) {
  getProjectDataNoErrCommit(req, res, function (user, project, commit) {
    var activeTab = req.query.tab in tabFuncs ? req.query.tab : 'overview';
    var data = {
      p: project,
      c: commit,
      tabs: tabs,
      activeTab: activeTab
    };

    tabFuncs[activeTab](req, res, data);
  });
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
  getProjectDataNoErrCommit(req, res, function (user, project, commit) {
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

exports.pdf = function (req, res) {
  // TODO: Change this with get latest commit.
  getProjectDataNoErrCommit(req, res, function (user, project, commit) {
    if (commit.pdfFile === null) return root.error404(req, res);
    res.setHeader('Content-Type', 'application/pdf');
    serveStoreFile(req, res, commit.pdfFile);
  });
};

exports.zip = function (req, res) {
  // TODO: Change this with get latest commit.
  getProjectDataNoErrCommit(req, res, function (user, project, commit) {
    res.setHeader('Content-disposition', 'attachment; filename=' +
        project.location + '.zip');
    serveStoreFile(req, res, commit.zipFile);
  });
};

exports.headPdf = function (req, res) {
  getProjectDataNoErrContrib(req, res, function (user, project) {
    serveHeadFile(req, res, projectMd.getPdfFileHead(project), project);
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

function downloadHead(req, res, project) {
  projectLogic.createHeadArchive(project, function (err, hash) {
    if (err) return root.error500(req, res, err);
    res.setHeader('Content-disposition', 'attachment; filename=' +
        project.location + '.zip');
    serveStoreFile(req, res, hash);
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

function getProjectDataNoErrCommit(req, res, callback) {
  getProjectDataNoErr(req, res, function (user, project) {
    var latestCommitId = project.commits[project.commits.length - 1];
    commitLogic.getCommitById(latestCommitId, function (err, commit) {
      if (err) return root.error500(req, res, err);
      if (!commit) return root.error404(req, res);
      callback(user, project, commit);
    });
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
  res.render('projectOverview', data);
}

function projectHistory(req, res, data) {
  res.render('projectHistory', data);
}
