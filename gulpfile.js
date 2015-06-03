var del         = require('del');
var gulp        = require('gulp');
var babel       = require('gulp-babel');
var bump        = require('gulp-bump');
var coffee      = require('gulp-coffee');
var concat      = require('gulp-concat');
var filter      = require('gulp-filter');
var header      = require('gulp-header');
var plumber     = require('gulp-plumber');
var prefixer    = require('gulp-autoprefixer');
var rename      = require('gulp-rename');
var uglify      = require('gulp-uglify');
var sass        = require('gulp-sass');
var tagVersion  = require('gulp-tag-version');
var umd         = require('gulp-wrap-umd');

// Variables
var distDir = './dist';
var pkg = require('./package.json');
var banner = ['/*!', pkg.name, pkg.version, '*/\n'].join(' ');
var umdOptions = {
  exports: 'Tether',
  namespace: 'Tether'
};


// Clean
gulp.task('clean', function() {
  del.sync([distDir]);
});


// TEMPORARY START
gulp.task('coffee', function() {
  gulp.src('./src/js/*.coffee')
    .pipe(plumber())
    .pipe(coffee({bare: true}))
    .pipe(gulp.dest(distDir + '/js/temp'));
});
gulp.task('combine', ['js', 'coffee'], function() {
  gulp.src([
    './dist/js/temp/utils.js',
    './dist/js/temp/tether.js',
    './dist/js/temp/constraint.js',
    './dist/js/temp/abutment.js',
    './dist/js/temp/shift.js'
  ])
    .pipe(concat('tether.js'))
    .pipe(umd(umdOptions))
    .pipe(gulp.dest(distDir + '/js'));
});
gulp.task('watch', ['combine'], function() {
  gulp.watch('./src/js/**/*', ['combine']);
});
// TEMPORARY END

// Javascript
gulp.task('js', function() {
  gulp.src([
    // './src/js/utils.js',
    // './src/js/tether.js',
    // './src/js/constraint.js',
    './src/js/abutment.js'
    // './src/js/shift.js'
  ])
    .pipe(plumber())
    .pipe(babel())
    // .pipe(concat('tether.js'))
    // .pipe(umd(umdOptions))
    // .pipe(header(banner))

    // Original
    .pipe(gulp.dest(distDir + '/js/temp'))

    // Minified
    // .pipe(uglify())
    // .pipe(rename({suffix: '.min'}))
    // .pipe(gulp.dest(distDir + '/js'));
});


// CSS
gulp.task('css', function() {
  gulp.src('./src/css/**/*.sass')
    .pipe(sass())
    .pipe(prefixer())
    .pipe(gulp.dest(distDir + '/css'));
});


// Version bump
var VERSIONS = ['patch', 'minor', 'major'];
for (var i = 0; i < VERSIONS.length; ++i){
  (function(version) {
    var pkgFilter = filter('package.json');
    gulp.task('version:' + version, function() {
      gulp.src(['package.json', 'bower.json', 'component.json'])
        .pipe(bump({type: version}))
        .pipe(pkgFilter)
        .pipe(tagVersion())
        .pipe(pkgFilter.restore())
        .pipe(gulp.dest('.'))
    });
  })(VERSIONS[i]);
}


// Watch
// gulp.task('watch', ['js', 'css'], function() {
//   gulp.watch('./src/js/**/*', ['js']);
//   gulp.watch('./src/css/**/*', ['css']);
// });


// Defaults
gulp.task('build', ['js', 'css'])
gulp.task('default', ['build'])

