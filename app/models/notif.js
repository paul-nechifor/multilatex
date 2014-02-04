exports.init = function (opts) {
  var doc = {
    projectId: opts.project._id,
    list: []
  };

  var notif = {
    type: 'created',
    date: opts.project.created
  };

  if (opts.forkFrom) {
    notif.forkUser = opts.forkFrom.username;
    notif.forkLocation = opts.forkFrom.location;
  }

  doc.list.push(notif);

  return doc;
};
