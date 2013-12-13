function jadeLocals(req, res, next) {
    res.locals.session = req.session;
    res.locals.prettyDate = prettyDate;
    next();
}

function prettyDate(date2){
    var date = new Date(date2);
    var d = date.getDate();
    var monthNames = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
    var m = monthNames[date.getMonth()];
    var y = date.getFullYear();
    return d+' '+m+' '+y;
}

module.exports = jadeLocals;