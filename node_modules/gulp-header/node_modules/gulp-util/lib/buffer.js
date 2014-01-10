var through = require('through');

module.exports = function(cb) {
  var buf = [];
  var end = function() {
    this.emit('data', buf);
    this.emit('end');
    if(cb) cb(null, buf);
  };
  return through(buf.push.bind(buf), end);
};