/* jshint node: true */
'use strict';

var path = require('path');
var fs = require('fs');

var es = require('event-stream');
var gutil = require('gulp-util');
var extend = require('lodash.assign');

var headerPlugin = function(headerText, data) {
  headerText = headerText || '';
  return es.map(function(file, cb){
    file.contents = Buffer.concat([
      new Buffer(gutil.template(headerText, extend({file : file}, data))),
      file.contents
    ]);
    cb(null, file);
  });
};

headerPlugin.fromFile = function (filepath, data){
  if ('string' !== typeof filepath) throw new Error('Invalid filepath');
  var fileContent = fs.readFileSync(path.resolve(process.cwd(), filepath));
  return headerPlugin(fileContent, data);
};

module.exports = headerPlugin;
