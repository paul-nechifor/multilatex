exports.init = function (project, callback) {
  var doc = {
    userId: project.userId,
    projectId: project._id,
    created: Date.now(),
    order: project.commits.length,

    files: project.headFiles,

    // The hash of every file above, or null if null
    hashes: null,

    mainFile: project.mainFile,
    changes: project.changes,

    // Null if not generated, hash otherwise.
    pdfFile: null,

    // ZIP archive of the project.
    zipFile: null,

    // List of the hashes of the thumbnails.
    thumbs: []
  };

  callback(undefined, doc);
};
