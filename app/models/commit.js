exports.init = function (project, callback) {
  var doc = {
    userId: project.userId,
    projectId: project._id,
    created: Date.now(),
    // Contributors who edited something in this commit.
    // User ID to time made change.
    contributorsIds: project.headContributors,
    // The main text file.
    mainFile: null,
    // Null if not generated, hash otherwise.
    pdfFile: null,
    // Dict of relative file path to store file hash.
    hashTree: null // Not set here.
  };
  callback(undefined, doc);
};
