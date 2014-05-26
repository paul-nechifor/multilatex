gulp = require 'gulp'
stylus = require 'gulp-stylus'
browserify = require 'gulp-browserify'
rename = require 'gulp-rename'
gutil = require 'gulp-util'
uglify = require 'gulp-uglify'
nib = require 'nib'
runSequence = require 'run-sequence'
{spawn} = require 'child_process'

production = '--production' in process.argv

gulp.task 'rsync', (cb) ->
  c = spawn 'rsync', [
    '-a', '--del'
    'app', 'config', 'data', 'node_modules', 'static'
    'build'
  ]
  c.stdout.on 'data', (d) -> process.stdout.write d
  c.on 'close', (code) ->
    return cb 'err-' + code unless code is 0
    cb()

cssTask = (prefix) ->
  gulp.task prefix + '-css',  ->
    # TODO: Compress.
    gulp.src "app/styles/#{prefix}/#{prefix}.styl"
    .pipe stylus
      use: [nib()]
      errors: true
    .pipe gulp.dest 'build/static/css'

cssTask 'site'
cssTask 'editor'

gulp.task 'editor-js', ->
  gulp.src 'editor/main.coffee', read: false
  .pipe browserify
    transform: ['coffeeify']
    extensions: ['.coffee']
    debug: !production
  .pipe rename 'editor.js'
  .pipe if production then uglify() else gutil.noop()
  .pipe gulp.dest 'build/static/js'

gulp.task 'bootstrap', ->
  gulp.src 'bower_components/bootstrap/dist/**/*.*',
      {base: 'bower_components/bootstrap/dist'}
  .pipe gulp.dest 'build/static/bootstrap'

gulp.task 'jslibs', ->
  bc = 'bower_components/'
  files = [
    bc + 'backbone/backbone.js'
    bc + 'underscore/underscore.js'
    bc + 'jquery-file-upload/js/jquery.fileupload.js'
    bc + 'jquery-file-upload/js/jquery.fileupload-ui.js'
    bc + 'jquery-file-upload/js/jquery.fileupload-jquery-ui.js'
    bc + 'jquery-file-upload/js/jquery.iframe-transport.js'
  ]
  gulp.src files
  .pipe uglify()
  .pipe gulp.dest 'build/static/jslibs'

gulp.task 'jslibs-other', ->
  gulp.src 'bower_components/jquery-file-upload/css/jquery.fileupload.css'
  .pipe gulp.dest 'build/static/css'

gulp.task 'static', ['bootstrap', 'jslibs', 'jslibs-other']

gulp.task 'build-files', ['site-css', 'editor-css', 'editor-js', 'static']

gulp.task 'build', (cb) ->
  runSequence 'rsync', 'build-files', cb

gulp.task 'default', ['build']
