var fs = require('fs');
var root = require('./root');

var app = null;

var POSTS_DIR = __dirname + '/../public/blog-data/posts/';
var INCLUDES_DIR = __dirname + '/../public/blog-data/includes/';

exports.setApp = function (pApp) {
  app = pApp;
};

exports.index = function (req, res) {
  render(req, res, INCLUDES_DIR + '/index.html');
};

exports.post = function (req, res) {
  render(req, res, POSTS_DIR + req.params.post + '.html');
};

function render(req, res, file) {
  fs.readFile(INCLUDES_DIR + 'side.html', function (err, side) {
    if (err) return root.error404(req, res);
    fs.readFile(file, function (err, data) {
      if (err) return root.error404(req, res);
      res.render('blog', {
        title: 'Multilatex Blog',
        side: side,
        data: data
      });
    });
  });
}
