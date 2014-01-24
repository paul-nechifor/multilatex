var userLogic = require('../logic/user');
var projectLogic = require('../logic/project');
var root = require('./root');

var app = null;

var tabs = [
  ['overview', 'Overview', null, 'film'],
  ['projects', 'Projects', '?tab=projects', 'folder-open'],
  ['activity', 'Activity', '?tab=activity', 'bullhorn']
];

var tabFuncs = {
  'overview': userOverview,
  'projects': userProjects,
  'activity': userActivity
};

exports.setApp = function (pApp) {
  app = pApp;
};

exports.login = function (req, res) {
  var data = {title: 'Login', loginActive: true};
  if (req.session.cameFrom) {
    data.globalData = {
      cameFrom: req.session.cameFrom
    };
    delete req.session.cameFrom;
  }
  res.render('login', data);
};

exports.password = function (req, res) {
  res.render('password', {title: 'Recover password'});
};

exports.register = function (req, res) {
  res.render('register', {title: 'Register', registerActive: true});
};

exports.create = function (req, res) {
  res.render('create', {title: 'Create a project'});
};

exports.username = function (req, res) {
  userLogic.getUser(req.params.username, function (err, user) {
    if (err) return root.error500(req, res, err);
    if (!user) return root.error404(req, res);

    var activeTab = req.query.tab in tabFuncs ? req.query.tab : 'overview';
    var data = {
      user: user,
      tabs: tabs,
      activeTab: activeTab
    };

    tabFuncs[activeTab](req, res, data);
  });
};

function userOverview(req, res, data) {
  var userId = data.user._id;
  projectLogic.getLatestProjectsForUser(userId, function (err, projects) {
    if (err) return root.error500(req, res, err);
    data.projects = projects;
    res.render('userOverview', data);
  });
}

function userProjects(req, res, data) {
  projectLogic.getProjectsForUser(data.user._id, function (err, projects) {
    if (err) return root.error500(req, res, err);
    data.projects = projects;
    res.render('userProjects', data);
  });
}

function userActivity(req, res, data) {
  res.render('userActivity', data);
}
