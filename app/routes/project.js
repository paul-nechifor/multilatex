var projectLogic = require('../logic/project');
var userLogic = require('../logic/user');
var root = require('./root');

var app = null;

var tabs = [
  ['overview', 'Overview', null],
  ['history', 'History', '?tab=history']
];

var tabFuncs = {
  'overview': projectOverview,
  'history': projectHistory
}

exports.setApp = function (pApp) {
  app = pApp;
};

exports.location = function (req, res) {
  var name = req.params.username;
  var loc = req.params.location;
  getProjectDataNoErr(name, loc, req, res, function (user, project) {
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
  var name = req.params.username;
  var loc = req.params.location;
  getProjectDataNoErr(name, loc, req, res, function (user, project) {
    if (!(req.session.userId in project.contribuitorsIds)) {
      root.error403(req, res, 'not-a-contribuitor');
      return;
    }
    
    var data = {
      project: project
    };
    
    res.render('editor', data);
  });
};

function getProjectDataNoErr(username, projectLocation, req, res, callback) {
  getProjectData(username, projectLocation, function (err, user, project) {
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
