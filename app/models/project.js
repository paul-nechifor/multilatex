var ObjectID = require('mongodb').ObjectID;

exports.init = function (opts, callback) {
  var doc = {
    username: opts.username,
    userId: typeof opts.userId === 'string'
        ? new ObjectID(opts.userId) : opts.userId,
    location: opts.location,
    created: Date.now(),
    downloads: 0,
    views: 0,
    // User ID to time added to project.
    contribuitorsIds: {},
    // Username to time added to project.
    contribuitors: {},
    // Project ID to date (timestamp).
    forksIds: {},
    // List of [username, projectLocation, timestamp].
    forks: [],
    commits: [],
    mergeRequests: [],
    // The location of the head files.
    headPath: opts.headPath || null,
    // The main text file.
    headFile: opts.headFile || null,
    // Dict of relative file path to value. If the value is true, the file is
    // in the head, if it is a string, that string is the hash of a file in the
    // file store.
    // TODO FIX THIS
    // Note that keys cannot have '.' in them so they are all replaced with '%'
    // before storing into Mongo and back when reading.
    headTree: {}
  };

  console.log('opts', opts);

  if (opts.headFiles) {
    console.log('files', opts.headFiles);
    for (var i = 0, len = opts.headFiles.length; i < len; i++) {
      doc.headTree[opts.headFiles[i]] = true;
    }
  }

  doc.contribuitors[opts.username] = doc.created;
  doc.contribuitorsIds[opts.userId.toString()] = doc.created;

  // TODO: Validate values.

  callback(undefined, doc);
};

exports.fixToMongo = function (doc) {
  var orig = doc.headTree;
  var mod = {};

  for (var item in orig) {
    mod[item.replace(/\./g, '%')] = orig[item];
  }

  doc.headTree = mod;
};

exports.fixFromMongo = function (doc) {
  var orig = doc.headTree;
  var mod = {};

  for (var item in orig) {
    mod[item.replace(/%/g, '.')] = orig[item];
  }

  doc.headTree = mod;
};
