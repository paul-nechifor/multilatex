gulp = require 'gulp'
stylus = require 'gulp-stylus'
browserify = require 'gulp-browserify'
rename = require 'gulp-rename'
gutil = require 'gulp-util'
uglify = require 'gulp-uglify'
nib = require 'nib'
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
  gulp.task prefix + '-css', ['rsync'],  ->
    # TODO: Compress.
    gulp.src "app/styles/#{prefix}/#{prefix}.styl"
    .pipe stylus
      use: [nib()]
      errors: true
    .pipe gulp.dest 'build/static/css'

cssTask 'site'
cssTask 'editor'

gulp.task 'editor-js', ['rsync'], ->
  gulp.src 'editor/main.coffee', read: false
  .pipe browserify
    transform: ['coffeeify']
    extensions: ['.coffee']
    debug: !production
  .pipe rename 'editor.js'
  .pipe if production then uglify() else gutil.noop()
  .pipe gulp.dest 'build/static/js'

gulp.task 'build', ['site-css', 'editor-css', 'editor-js']

gulp.task 'default', ['build']
