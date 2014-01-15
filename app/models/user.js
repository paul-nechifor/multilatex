exports.init = function (opts, callback) {
  var err = checkValidity(opts);
  if (err) return callback(err);

  // TODO: Check if name is on a forbidden list.

  var doc = {
    username: opts.username,
    registered: Date.now(),
    passwordSha1: null,
    // Hash of the avatar in the file store.
    avatarHash: null,
    // Small version.
    avatarHashS: null,
    // Extra small version.
    avatarHashXs: null,
    prefs: {
      editorFontSize: 14,
      editorShowLines: true,
      vertPaneRatios: [0.2, 0.45, 0.35],
      sepCollapsed: [false, false]
    }
  };

  if (opts.email) {
    doc.email = opts.email;
  }

  callback(undefined, doc);
};

function checkValidity(doc) {
  var err;

  err = checkUsernameValidity(doc.username);
  if (err) {
    return err;
  }

  err = checkPasswordValidity(doc.password);
  if (err) {
    return err;
  }

  return null;
}

// TODO: Do more advanced checks.
// TODO: Check reserved list.
function checkUsernameValidity(username) {
  if (!username || username.length === 0) {
    return 'no-username-given';
  }

  if (!/[a-zA-Z][a-zA-Z0-9.-]{0,32}/.test(username)) {
    return 'invalid-username';
  }

  return null;
}

// TODO: Check in bad passwords.
function checkPasswordValidity(password) {
  if (typeof password !== 'string') {
    return 'No password';
  }

  return null;
}
