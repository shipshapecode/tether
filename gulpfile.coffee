gulp = require('gulp')
coffee = require('gulp-coffee')
compass = require('gulp-compass')
concat = require('gulp-concat')
uglify = require('gulp-uglify')
header = require('gulp-header')
rename = require('gulp-rename')
{exec} = require('child_process')
Q = require('q')

pkg = require('./package.json')

bannerDeferred = Q.defer()
exec '/usr/bin/env git describe HEAD --tags', (err, stdout, stderr) ->
  if err or stderr
    throw new Error "Error getting git versioning info"

  bannerDeferred.resolve "/*! #{ pkg.name } #{ stdout.trim() } */"

gulp.task 'coffee', ->
  gulp.src('./coffee/*')
    .pipe(coffee())
    .pipe(gulp.dest('./js/'))

gulp.task 'concat', ->
  bannerDeferred.promise.then (banner) ->
    gulp.src(['./js/utils.js', './js/tether.js', './js/constraint.js', './js/abutment.js', './js/shift.js'])
      .pipe(concat('tether.js'))
      .pipe(header(banner, {pkg}))
      .pipe(gulp.dest('./'))

gulp.task 'uglify', ->
  bannerDeferred.promise.then (banner) ->
    gulp.src('./tether.js')
      .pipe(uglify())
      .pipe(header(banner, {pkg}))
      .pipe(rename('tether.min.js'))
      .pipe(gulp.dest('./'))

gulp.task 'js', ->
  gulp.run 'coffee', 'concat', 'uglify'

gulp.task 'compass', ->
  for path in ['', 'docs/', 'docs/welcome/']
    gulp.src("./#{ path }sass/*")
      .pipe(compass(
        sass: "#{ path }sass"
        css: "#{ path }css"
        comments: false
      ))
      .pipe(gulp.dest("./#{ path }css"))

gulp.task 'default', ->
  gulp.run 'js', 'compass'

  gulp.watch './coffee/*', ->
    gulp.run 'js'

  gulp.watch './**/*.sass', ->
    gulp.run 'compass'
