var crypto = require('crypto');

function die(string) {
  console.trace();
  console.error(string);
  process.exit(1);
}

var BASE36 = '0123456789abcdefghijklmnopqrstuvwxyz';

function randomBase36(length) {
    var ret = '';
    var index;

    for (var i = 0; i < length; i++) {
        index = (Math.random() * BASE36.length) | 0;
        ret += BASE36[index];
    }

    return ret;
}

function sha1Sum(string) {
  var hash = crypto.createHash('sha1');
  hash.update(string);
  return hash.digest('hex');
}

exports.die = die;
exports.randomBase36 = randomBase36;
exports.sha1Sum = sha1Sum;
