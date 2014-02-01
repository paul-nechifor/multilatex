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
      console.log(req.url);
      if (orig.indexOf('explore') === 0 && req.url !== '/explore') {
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

  if (req.query.after) {
    query._id = {$lt: new ObjectID(req.query.after)};
  }

  projectLogic.getExplore(query, sort, function (err, projects) {
    if (err) return root.error500(req, res, err);
    commitLogic.getForProjects(projects, true, function (err, projects) {
      if (err) return root.error500(req, res, err);
      callback(projects);
    });
  });
}
