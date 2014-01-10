# gulp-header [![NPM version](https://badge.fury.io/js/gulp-header.png)](http://badge.fury.io/js/gulp-header) [![Build Status](https://travis-ci.org/godaddy/gulp-header.png)](https://travis-ci.org/godaddy/gulp-header)

Gulp extension to add a header to file(s) in the pipeline

```javascript
var header = require('gulp-header');
```

## Usage

```javascript
var header = require('gulp-header');

gulp.src('./foo/*.js')
  .pipe(header('Hello'))
  .pipe(gulp.dest('./dist/')

gulp.src('./foo/*.js')
  .pipe(header('Hello <%= name %>\n', { name : 'World'} ))
  .pipe(gulp.dest('./dist/')

gulp.src('./foo/*.js')
  .pipe(header('Hello ${name}\n', { name : 'World'} ))
  .pipe(gulp.dest('./dist/')


//


var pkg = require('./package.json');
var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''].join('\n');

gulp.src('./foo/*.js')
  .pipe(header(banner, { pkg : pkg } ))
  .pipe(gulp.dest('./dist/')

gulp.src('./foo/*.js')
  .pipe(header.fromFile('banner.js', { pkg : pkg } ))
  .pipe(gulp.dest('./dist/')
```

## API

### header(text, data)

#### text

Type: `String`  
Default: `''`  

The template text.


#### data

Type: `Object`  
Default: `{}`  

The data object used to populate the text.


### header.fromFile(filePath, data)

#### filePath

Type: `String`  

The path of the template file.


#### data

Type: `Object`  
Default: `{}`  

The data object used to populate the text.
