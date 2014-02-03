var ObjectID = require('mongodb').ObjectID;

exports.init = function (opts, callback) {
  var doc = {
    username: opts.username,
    userId: typeof opts.userId === 'string' ?
        new ObjectID(opts.userId) : opts.userId,
    location: opts.location,
    created: Date.now(),
    downloads: 0,
    views: 0,

    notifId: null,

    // The time of the last commit.
    commitTime: -1,

    // User ID to time added to project.
    contributorsIds: {},

    // Username to time added to project.
    contributors: {},

    // ProjectId of fork.
    forkedFrom: null,

    forkedFromOrder: -1,
    forkedUser: null,
    forkedLoc: '',

    commits: [],
    mergeRequests: [],

    // The location of the head files.
    headPath: opts.headPath || null,

    // Array of relative file paths. The index is the id of the file. When files
    // are deleted the value is set to null and never reclaimed.
    headFiles: opts.headFiles || [],

    // Index of the main file.
    mainFile: opts.mainFile >= 0 ? opts.mainFile : -1,

    // People who modified the state since the last commit.
    modders: {}
  };

  doc.contributors[opts.username] = doc.created;
  doc.contributorsIds[opts.userId.toString()] = doc.created;
  doc.modders[opts.userId.toString()] = true;

  // TODO: Validate values.

  callback(undefined, doc);
};

exports.getPublic = function (doc) {
  var ret = {};

  for (var key in doc) {
    ret[key] = doc[key];
  }

  delete ret.headPath;

  return ret;
};

exports.getPdfFileHead = function (doc) {
  var head = doc.headFiles[doc.mainFile];
  return head.substring(0, head.length - 4) + '.pdf';
};

exports.getPdfFile = function (doc) {
  return doc.headPath + '/' + exports.getPdfFileHead(doc);
};

exports.initFork = function (uid, name, project, commit) {
  // TODO: Maybe find a better way.
  var doc = JSON.parse(JSON.stringify(project));

  delete doc._id;
  doc.userId = new ObjectID(uid);
  doc.username = name;

  var con = {};
  con[doc.username] = doc.created;
  doc.contributors = con;

  var codIds = {};
  codIds[doc.userId.toString()] = doc.created;
  doc.contributorsIds = codIds;

  doc.forkedFrom = project._id;
  doc.forkedFromOrder = commit.order;
  doc.forkedUser = project.username;
  doc.forkedLoc = project.location;

  // TODO: Check this doesn't have bad side effects.
  doc.commits = project.commits;

  return doc;
};
