var projectLogic = require('../logic/project');
var userLogic = require('../logic/user');
var root = require('./root');

var app = null;

exports.setApp = function (pApp) {
  app = pApp;
};

exports.location = function (req, res) {
  var username = req.params.username;
  var projectLocation = req.params.location;
  getProjectData(username, projectLocation, function (err, data) {
    if (err) {
      if (err === 'project-not-found') {
        root.error404(req, res);
      } else {
        root.error500(req, res);
      }
      return;
    }
    
    res.render('project', {p: data});
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
