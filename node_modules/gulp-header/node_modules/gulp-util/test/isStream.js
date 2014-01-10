var util = require('../');
var should = require('should');
var path = require('path');
var through = require('through');
require('mocha');

describe('isStream()', function(){
  it('should work on a stream', function(done){
    util.isStream(through(function(){})).should.equal(true);
    done();
  });
  it('should not work on a buffer', function(done){
    util.isStream(new Buffer('huh')).should.equal(false);
    done();
  });
});