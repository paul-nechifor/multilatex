var crypto = require('crypto');

function sha1Sum(string) {
  var hash = crypto.createHash('sha1');
  hash.update(string);
  return hash.digest('hex');
}

function die(string) {
  console.error(string);
  process.exit(1);
}

exports.sha1Sum = sha1Sum;
