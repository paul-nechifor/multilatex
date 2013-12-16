var userLogic = require('../logic/user');
var root = require('./root');

var app = null;

var tabs = [
  ['overview', 'Overview'],
  ['projects', 'Projects'],
  ['activity', 'Activity']
];

var tabFuncs = {
  'overview': userOverview,
  'projects': userProjects,
  'activity': userActivity
}

exports.setApp = function (pApp) {
  app = pApp;
};

exports.login = function (req, res) {
  res.render('login', {title: 'Login'});
};

exports.password = function (req, res) {
  res.render('password', {title: 'Recover password'});
};

exports.register = function (req, res) {
  res.render('register', {title: 'Register'});
};

exports.create = function (req, res) {
  res.render('create', {title: 'Create Project'});
};

exports.username = function (req, res) {
  userLogic.getUser(req.params.username, function (err, user) {
    if (err) {
      if (err === 'not-found') {
        root.error404(req, res);
      } else {
        root.error500(req, res);
      }
      return;
    }
    
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
  data.title = data.user.username;
  res.render('userOverview', data);
}

function userProjects(req, res, data) {
  data.title = data.user.username + "'s projects";
  res.render('userProjects', data);
}

function userActivity(req, res, data) {
  data.title = data.user.username + "'s activity";
  res.render('userActivity', data);
}
