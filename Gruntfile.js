var fs = require('fs');
var shellSpawn = require('./tools/shell-spawn');

module.exports = function (grunt) {
  var config = require('./config/config');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> ' +
            '<%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      editor: {
        files: {
          'static/js/editor.min.js': ['static/js/editor.js']
        }
      }
    },
    remove: {
      editorNonMin: {
        fileList: ['./static/js/editor.js']
      }
    },
    rename: {
      editorFromMin: {
        files: [{src: './static/js/editor.min.js', dest: './static/js/editor.js'}]
      }
    },
    browserify: {
      editor: {
        options: {
          debug: config.debug
        },
        files: {
          './static/js/editor.js': './editor/main.js'
        }
      }
    },
    stylus: {
      compile: {
        options: {},
        files: {
          './static/css/editor.css': [
            'app/styles/editor.styl',
            'app/styles/pdfjs.styl'
          ],
          './static/css/style.css': ['app/styles/style.styl']
        }
      }
    },
    'shell-spawn': {
      useradd: {
        options: {failOnError: false},
        base: ['useradd', '-m', '-d', config.dirs.home, config.username]
      },
      mkdirs: {
        base: ['mkdir', '-p'],
        multi: [
          [config.dirs.logs],
          [config.dirs.heads],
          [config.dirs.store],
          [config.dirs.tmp],
          [config.dirs.install],
          [config.dirs.upload]
        ],
        runAs: [config.username, config.username]
      },
      startService: {
        base: ['start', config.username]
      },
      stopService: {
        options: {failOnError: false},
        base: ['stop', config.username]
      },
      rsyncApp: {
        base: ['rsync', '-a', '--del', '--exclude', '.git',
            __dirname + '/.', config.dirs.install],
        runAs: [config.username, config.username]
      },
      deploy: {
        base: [
          'bash',
          __dirname + '/tools/scripts/deploy.sh',
          config.deploy.hostname,
          config.deploy.work,
          __dirname
        ]
      },
      userdel: {
        options: {failOnError: false},
        base: ['userdel', '-r', config.username]
      },
      removeDirs: {
        base: ['rm', '-fr'],
        multi: [
          [config.dirs.logs],
          [config.dirs.heads],
          [config.dirs.store],
          [config.dirs.tmp],
          [config.dirs.install],
          [config.dirs.upload],
          [config.dirs.home]
        ]
      },
      templates: {
        base: ['grunt', 'templates-as-multilatex'],
        runAs: [config.username, config.username]
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-rename');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-remove');

  shellSpawn(grunt);

  if (config.debug) {
    grunt.registerTask('editor', [
      'remove:editorNonMin',
      'browserify:editor'
    ]);
  } else {
    grunt.registerTask('editor', [
      'editor',
      'uglify:editor',
      'remove:editorNonMin',
      'rename:editorFromMin'
    ]);
  }

  grunt.registerTask('setup-base', [
    'require-root',
    'shell-spawn:useradd',
    'shell-spawn:mkdirs'
  ]);

  grunt.registerTask('build', [
    'editor',
    'stylus:compile'
  ]);

  grunt.registerTask('install', [
    'require-root',
    'shell-spawn:stopService',
    'setup-base',
    'create-upstart',
    'shell-spawn:rsyncApp'
  ]);

  grunt.registerTask('start', [
    'shell-spawn:startService'
  ]);

  grunt.registerTask('deploy', [
    'shell-spawn:deploy'
  ]);

  grunt.registerTask('require-root', 'Fails if not root.', function () {
    if (!process.getuid || process.getuid() !== 0) {
      grunt.log.error('You have to be root.');
      return false;
    }
  });

  grunt.registerTask('create-upstart', 'Create upstart script.', function () {
    function replaceFileTemplate(fileName, vals) {
      var file = fs.readFileSync(fileName).toString();
      return replaceTemplate(file, vals);
    }
    function replaceTemplate(template, vals) {
      var ret = template;
      for (var key in vals) {
        ret = ret.replace(new RegExp('{{' + key + '}}', 'g'), vals[key]);
      }
      return ret;
    }

    var confFile = __dirname + '/data/upstart/multilatex.conf';
    var conf = replaceFileTemplate(confFile, {
      username: config.username,
      home: config.dirs.home,
      install: config.dirs.install,
      logs: config.dirs.logs
    });

    fs.writeFileSync('/etc/init/multilatex.conf', conf);
  });

  grunt.registerTask('logs', 'Watch logs.', function () {
    this.async(); // Never ending.

    var files = fs.readdirSync(config.dirs.logs);
    if (files.length === 0) {
      grunt.log.writeln('No logs.');
      return;
    }

    files.sort();
    var lastLog = config.dirs.logs + '/' + files[files.length - 1];

    var spawn = require('child_process').spawn;
    var child = spawn('tail', ['-f', lastLog]);
    child.stdout.pipe(process.stdout);
  });

  grunt.registerTask('templates-as-multilatex', 'Add templates.', function () {
    var done = this.async();
    var templates = require('./app/logic/templates');
    templates.recreate(config, function (err) {
      if (err) {
        grunt.log.error(err);
        done(false);
        return;
      }
      done();
    });
  });

  grunt.registerTask('clear-db', 'Remove all from the DB.', function () {
    var done = this.async();
    var Database = require('./app/lib/Database');
    var db = new Database(config.mongoUrl);
    db.connect(function () {
      db.db.dropDatabase(function (err, result) {
        if (err) grunt.log.error(err);
        db.disconnect(function (err) {
          if (err) grunt.log.error(err);
          done();
        });
      });
    });
  });

  grunt.registerTask('wipe-everything', [
    'require-root',
    'shell-spawn:stopService',
    'shell-spawn:userdel',
    'shell-spawn:removeDirs',
    'clear-db'
  ]);

  grunt.registerTask('templates', [
    'require-root',
    'shell-spawn:templates'
  ]);

  grunt.registerTask('default', ['build']);
};
