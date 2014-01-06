var projectLogic = require('../logic/project');
var userLogic = require('../logic/user');
var fileStore = require('../logic/fileStore');
var util = require('../logic/util');
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
  getProjectDataNoErr(req, res, function (user, project) {
    var activeTab = req.query.tab in tabFuncs ? req.query.tab : 'overview';
    var data = {
      p: project,
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

exports.headFiles = function (req, res) {
  var file = req.param(0);

  getProjectDataNoErrContrib(req, res, function (user, project) {
    var value = project.headTree[file];

    if (typeof value === 'string') {
      serveStoreFile(req, res, value);
      return;
    }

    serveHeadFile(req, res, file, project);
  });
};

function serveHeadFile(req, res, file, project) {
  util.pipeFile(project.headPath + '/' + file, res);
}

function serveStoreFile(req, res, hash) {
  var path = fileStore.getPath(hash);
  util.pipeFile(path, res);
}

function getProjectDataNoErrContrib(req, res, callback) {
  getProjectDataNoErr(req, res, function (user, project) {
    if (!(req.session.userId in project.contribuitorsIds)) {
      root.error403(req, res, 'not-a-contribuitor');
      return;
    }

    callback(user, project);
  });
}

function getProjectDataNoErr(req, res, callback) {
  var username = req.params.username;
  var location = req.params.location;
  getProjectData(username, location, function (err, user, project) {
    if (err) {
      if (err === 'project-not-found') {
        root.error404(req, res);
      } else {
        root.error500(req, res);
        console.error(err);
      }
      return;
    }

    callback(user, project);
  });
}

function getProjectData(username, projectLocation, callback) {
  userLogic.getUser(username, function (err, user) {
    if (err) return callback(err);

    projectLogic.getProject(user._id, projectLocation, function (err, project) {
      if (err) return callback(err);
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
