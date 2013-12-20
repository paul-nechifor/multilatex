exports.init = function (opts, callback) {
  var doc = {
    username: opts.username,
    userId: opts.userId,
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
    headPath: null,
    // The main text file.
    headFile: null,
    // Dict of relative file path to value. If the value is null, the file is
    // in the head, if it is a string, that string is the hash of a file in the
    // file store.
    headTree: {}
  };
  
  doc.contribuitors[opts.username] = doc.created;
  doc.contribuitorsIds[opts.userId.toString()] = doc.created;
  
  // TODO: Validate values.
  
  callback(undefined, doc);
};
