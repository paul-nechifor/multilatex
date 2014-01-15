var app = null;

exports.setApp = function (pApp) {
  app = pApp;
};

exports.index = function (req, res) {
  res.render('explore', {title: 'Explore'});
};