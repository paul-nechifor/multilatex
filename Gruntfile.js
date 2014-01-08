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
        base: ['useradd', '-m', '-d', config.dirs.home, config.username],
      },
      mkdirs: {
        base: ['mkdir', '-p'],
        multi: [
          [config.dirs.logs],
          [config.dirs.heads],
          [config.dirs.store],
          [config.dirs.tmp],
          [config.dirs.install]
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
        base: ['rsync', '-a', '--del', __dirname, config.dirs.install],
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
    'shell-spawn:useradd',
    'shell-spawn:mkdirs'
  ]);

  grunt.registerTask('build', [
    'editor',
    'stylus:compile'
  ]);

  grunt.registerTask('install', [
    'shell-spawn:stopService',
    'setup-base',
    'shell-spawn:rsyncApp'
  ]);

  grunt.registerTask('start', [
    'shell-spawn:startService'
  ]);

  grunt.registerTask('default', ['build']);
};
