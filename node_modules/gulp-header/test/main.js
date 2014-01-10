/* jshint node: true */
/* global describe, it, beforeEach */
'use strict';

var header = require('../');
var should = require('should');
var gutil = require('gulp-util');
require('mocha');

describe('gulp-header', function() {
  var fakeFile;

  function getFakeFile(fileContent){
    return new gutil.File({
      path: './test/fixture/file.js',
      cwd: './test/',
      base: './test/fixture/',
      contents: new Buffer(fileContent || '')
    });
  }

  beforeEach(function(){
    fakeFile = getFakeFile('Hello world');
  });

  describe('header', function() {

    it('file should pass through', function(done) {
      var file_count = 0;
      var stream = header();
      stream.on('data', function(newFile){
        should.exist(newFile);
        should.exist(newFile.path);
        should.exist(newFile.relative);
        should.exist(newFile.contents);
        newFile.path.should.equal('./test/fixture/file.js');
        newFile.relative.should.equal('file.js');
        newFile.contents.toString().should.equal('Hello world');
        ++file_count;
      });

      stream.once('end', function () {
        file_count.should.equal(1);
        done();
      });

      stream.write(fakeFile);
      stream.end();
    });


    it('should prepend the header to the file content', function(done) {
      var stream = header('And then i said : ');
      stream.on('data', function (newFile) {
        should.exist(newFile.contents);
        newFile.contents.toString().should.equal('And then i said : Hello world');
      });
      stream.once('end', done);

      stream.write(fakeFile);
      stream.end();
    });


    it('should format the header', function(done) {
      var stream = header('And then <%= foo %> said : ', { foo : 'you' } );
      //var stream = header('And then ${foo} said : ', { foo : 'you' } );
      stream.on('data', function (newFile) {
        should.exist(newFile.contents);
        newFile.contents.toString().should.equal('And then you said : Hello world');
      });
      stream.once('end', done);

      stream.write(fakeFile);
      stream.end();
    });


    it('should format the header (ES6 delimiters)', function(done) {
      var stream = header('And then ${foo} said : ', { foo : 'you' } );
      stream.on('data', function (newFile) {
        should.exist(newFile.contents);
        newFile.contents.toString().should.equal('And then you said : Hello world');
      });
      stream.once('end', done);

      stream.write(fakeFile);
      stream.end();
    });


    it('should access to the current file', function(done) {
      var stream = header([
        '<%= file.relative %>',
        '<%= file.path %>',
        ''].join('\n'));
      stream.on('data', function (newFile) {
        should.exist(newFile.contents);
        newFile.contents.toString().should.equal('file.js\n./test/fixture/file.js\nHello world');
      });
      stream.once('end', done);

      stream.write(fakeFile);
      stream.end();
    });

  });


  describe('header.fromFile()', function() {

    it('should throw invalid filepath error', function() {
      (function(){
        header.fromFile();
      }).should.throw('Invalid filepath');
    });

    it('should throw invalid filepath error', function() {
      (function(){
        header.fromFile('haters gonna hate');
      }).should.throwError(/^ENOENT/);
    });

    it('should use a file content as header', function(done) {
      var file_count = 0;
      var stream = header.fromFile('./test/sample', { authors : ['foo', 'bar']});
      stream.on('data', function(newFile){
        should.exist(newFile);
        should.exist(newFile.path);
        should.exist(newFile.relative);
        should.exist(newFile.contents);
        newFile.path.should.equal('./test/fixture/file.js');
        newFile.relative.should.equal('file.js');
        newFile.contents.toString().should.equal([
          '//',
          '// file.js',
          '// Created by foo,bar',
          '//',
          'Hello world'
          ].join('\n'));
        ++file_count;
      });

      stream.once('end', function () {
        file_count.should.equal(1);
        done();
      });

      stream.write(fakeFile);
      stream.end();
    });

  });
});
