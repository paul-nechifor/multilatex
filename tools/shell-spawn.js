var spawn = require('child_process').spawn;

module.exports = function (grunt) {
  grunt.registerMultiTask('shell-spawn', 'Run sane commands.', function () {
    var opts = this.options({
      failOnError: true
    });

    var done = this.async();
    var cmds = buildCommands(this.data, opts);

    if (this.data.runAs !== undefined) {
      getIds(this.data.runAs[0], this.data.runAs[1], function (ids) {
        runCommands(cmds, ids, opts, grunt, done);
      });
      return;
    }

    runCommands(cmds, null, opts, grunt, done);
  });
};

function getIds(username, group, callback) {
  var ret = {};
  getCmdOut('id', ['-u', username], function (data) {
    ret.uid = parseInt(data);
    getCmdOut('id', ['-g', group], function (data) {
      ret.gid = parseInt(data);
      callback(ret);
    });
  });
}

function getCmdOut(name, args, callback) {
  var c = spawn(name, args);
  var ret = '';
  c.stdout.on('data', function (data) {
    ret += data;
  });
  c.on('close', function (code) {
    callback(ret);
  });
}

function buildCommands(data, opts) {
  var base = data.base || [];
  var cmds = [];

  if (!data.multi) {
    return [base];
  }

  for (var i = 0, len = data.multi.length; i < len; i++) {
    var full = base.slice(0);
    full.push.apply(full, data.multi[i]);
    cmds.push(full);
  }

  return cmds;
}

function runCommands(cmds, ids, opts, grunt, done) {
  var i = 0;

  var next = function () {
    if (i >= cmds.length) return done();
    runCommand(cmds[i], ids, grunt, function (code) {
      if (code !== 0 && opts.failOnError) return done(false);
      i++;
      next();
    });
  };

  next();
}

function runCommand(cmd, ids, grunt, callback) {
  var args = cmd.slice(0);
  var name = args.shift();
  var opts = {};
  if (ids) {
    opts.uid = ids.uid;
    opts.gid = ids.gid;
  }

  var command = spawn(name, args, opts);

  grunt.log.writeln('>>> ' + cmd.join(' '));

  command.stdout.on('data', function (data) {
    grunt.log.write(data);
  });

  command.on('close', function (code) {
    if (code !== 0) {
      grunt.log.error('Return code: ' + code);
    }
    callback(code);
  });
}