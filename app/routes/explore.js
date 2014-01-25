var commitLogic = require('../logic/commit');
var projectLogic = require('../logic/project');
var root = require('./root');
var ObjectID = require('mongodb').ObjectID;

var app = null;

exports.setApp = function (pApp) {
  app = pApp;
};

exports.index = function (req, res) {
  getExplore(req, res, function (projects) {
    var nextPage = null;
    if (projects.length > 0) {
      nextPage = '/explore?after=' + projects[projects.length - 1]._id;
    }

    // If the referer starts with '/explore', use it for the back button.
    var prevPage = null;
    if (req.headers.referer) {
      var parts = req.headers.referer.split('/');
      var orig = parts[3];
      if (orig.indexOf('explore') === 0) {
        prevPage = orig;
      }
    }

    res.render('explore', {
      title: 'Explore',
      projects: projects,
      prevPage: prevPage,
      nextPage: nextPage,
      exploreActive: true
    });
  });
};

function getExplore(req, res, callback) {
  var sort = {commitTime: -1};
  var query = {};

  if (req.query.user) {
    query.username = req.query.user;
  }

  if (req.query.after) {
    query._id = {$lt: new ObjectID(req.query.after)};
  }

  projectLogic.getExplore(query, sort, function (err, projects) {
    if (err) return root.error500(req, res, err);
    addCommits(req, res, projects, callback);
  });
}

function addCommits(req, res, projects, callback) {
  var mapping = {};
  var ids = [];

  for (var i = 0, len = projects.length; i < len; i++) {
    var p = projects[i];
    mapping[p._id] = {
      project: p
    };
    ids.push(p.commits[p.commits.length - 1]);
  }

  commitLogic.getInList(ids, function (err, commits) {
    if (err) return root.error500(req, res, err);

    for (var i = 0, len = commits.length; i < len; i++) {
      var commit = commits[i];
      mapping[commit.projectId].project.commit = commit;
    }

    var ret = [];

    for (var id in mapping) {
      var project = mapping[id].project;
      if (project.commit && project.commit.pdfFile !== null) {
        ret.push(project);
      }
    }

    callback(ret);
  });
}
