gulp      = require('gulp')
coffee    = require('gulp-coffee')
concat    = require('gulp-concat')
header    = require('gulp-header')
prefixer  = require('gulp-autoprefixer')
rename    = require('gulp-rename')
sass      = require('gulp-sass')
uglify    = require('gulp-uglify')
wrap      = require('gulp-wrap-umd')

pkg = require('./package.json')
banner = "/*! #{ pkg.name } #{ pkg.version } */\n"

gulp.task 'coffee', ->
  gulp.src('./coffee/*')
    .pipe(coffee())
    .pipe(gulp.dest('./js/'))

  gulp.src('./docs/coffee/*')
    .pipe(coffee())
    .pipe(gulp.dest('./docs/js/'))

  gulp.src('./docs/welcome/coffee/*')
    .pipe(coffee())
    .pipe(gulp.dest('./docs/welcome/js/'))

gulp.task 'concat', ->
  gulp.src(['./js/utils.js', './js/tether.js', './js/constraint.js', './js/abutment.js', './js/shift.js'])
    .pipe(concat('tether.js'))
    .pipe(wrap(
      namespace: 'Tether'
      exports: 'this.Tether'
    ))
    .pipe(header(banner))
    .pipe(gulp.dest('./'))

gulp.task 'uglify', ->
  gulp.src('./tether.js')
    .pipe(uglify())
    .pipe(header(banner))
    .pipe(rename('tether.min.js'))
    .pipe(gulp.dest('./'))

gulp.task 'js', ->
  gulp.run 'coffee', ->
    gulp.run 'concat', ->
      gulp.run 'uglify', ->

gulp.task 'sass', ->
  for path in ['', 'docs/', 'docs/welcome/']
    gulp.src("./#{ path }sass/*")
      .pipe(sass())
      .pipe(prefixer())
      .pipe(gulp.dest("./#{ path }css"))

gulp.task 'default', ->
  gulp.run 'js', 'sass'

  gulp.watch './**/*.coffee', ->
    gulp.run 'js'

  gulp.watch './**/*.sass', ->
    gulp.run 'sass'
