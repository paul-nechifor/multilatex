var fs = require('fs');

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
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-rename');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-remove');

  grunt.registerTask('editor', [
    'remove:editorNonMin',
    'browserify:editor'
  ]);

  grunt.registerTask('editor-min', [
    'editor',
    'uglify:editor',
    'remove:editorNonMin',
    'rename:editorFromMin'
  ]);
  grunt.registerTask('default', ['editor', 'stylus:compile']);
};
