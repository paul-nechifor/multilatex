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
    contributorsIds: {},

    // Username to time added to project.
    contributors: {},

    // Project ID to date (timestamp).
    forksIds: {},

    // List of [username, projectLocation, timestamp].
    forks: [],
    commits: [],
    mergeRequests: [],

    // The location of the head files.
    headPath: opts.headPath || null,

    // Array of relative file paths. The index is the id of the file. When files
    // are deleted the value is set to null and never reclaimed.
    headFiles: opts.headFiles || [],

    // Index of the main file.
    mainFile: opts.mainFile || -1,

    // Changes made from last commit. Array of array.
    // ['add', fileId, userId]
    // ['mod', path, userId]
    // ['del', path, userId]
    // ['move', src, dst, userId]
    changes: []
  };

  doc.contributors[opts.username] = doc.created;
  doc.contributorsIds[opts.userId.toString()] = doc.created;

  // TODO: Validate values.

  callback(undefined, doc);
};
