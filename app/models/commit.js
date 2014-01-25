exports.init = function (project, callback) {
  var doc = {
    userId: project.userId,
    projectId: project._id,
    created: Date.now(),
    order: project.commits.length,

    files: project.headFiles,

    // The hash of every file above, or null for every file which is null.
    hashes: null,

    mainFile: project.mainFile,
    modders: project.modders,

    // Array of modifications of type: [fid, type, ...].
    // a=added, d=deleted, m=moved, c=changed, cm=changedAndMoved
    // if d, m or cm, then the old path is also included in the array.
    mods: [],

    // Null if not generated, hash otherwise.
    pdfFile: null,

    // ZIP archive of the project.
    zipFile: null,

    // List of the hashes of the thumbnails.
    thumbs: []
  };

  callback(undefined, doc);
};
