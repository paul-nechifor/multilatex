function jadeLocals(req, res, next) {
  res.locals.session = req.session;
  res.locals.prettyDate = prettyDate;
  res.locals.storeUrl = storeUrl;
  next();
}

function prettyDate(date2) {
  var date = new Date(date2);
  var d = date.getDate();
  var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
      "Sep", "Oct", "Nov", "Dec" ];
  var m = monthNames[date.getMonth()];
  var y = date.getFullYear();
  return d+' '+m+' '+y;
}

function storeUrl(hash) {
  return '/store/' + hash.substring(0, 3) + '/' + hash.substring(3);
}

module.exports = jadeLocals;