gulp = require 'gulp'
stylus = require 'gulp-stylus'
nib = require 'nib'
{spawn} = require 'child_process'

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

gulp.task 'build', ['site-css', 'editor-css']

gulp.task 'default', ['build']
