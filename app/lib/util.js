var crypto = require('crypto');

function die(string) {
  console.error(string);
  process.exit(1);
}

function sha1Sum(string) {
  var hash = crypto.createHash('sha1');
  hash.update(string);
  return hash.digest('hex');
}

exports.die = die;
exports.sha1Sum = sha1Sum;
