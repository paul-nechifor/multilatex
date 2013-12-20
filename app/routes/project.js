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
  var username = req.params.username;
  var projectLocation = req.params.location;
  getProjectData(username, projectLocation, function (err, project) {
    if (err) {
      if (err === 'project-not-found') {
        root.error404(req, res);
      } else {
        root.error500(req, res);
      }
      return;
    }
    
    var activeTab = req.query.tab in tabFuncs ? req.query.tab : 'overview';
    var data = {
      p: project,
      tabs: tabs,
      activeTab: activeTab
    };
    
    tabFuncs[activeTab](req, res, data);
  });
};

function getProjectData(username, projectLocation, callback) {
  userLogic.getUser(username, function (err, user) {
    if (err) return callback(err);
    
    projectLogic.getProject(user._id, projectLocation, function (err, project) {
      if (err) return callback(err);
      callback(undefined, project);
    });
  });
}

function projectOverview(req, res, data) {
  res.render('projectOverview', data);
}

function projectHistory(req, res, data) {
  res.render('projectHistory', data);
}
