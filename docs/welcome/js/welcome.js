(function() {
  var init, setupDemo;

  init = function() {
    return setupDemo();
  };

  setupDemo = function() {
    var $target, frameLengthMS, frames, openAllDrops, openIndex, openNextDrop, position, positions, _i, _len;
    $target = $('.drop-target-demo');
    positions = ['top left', 'left top', 'left bottom', 'bottom left', 'bottom right', 'right bottom', 'right top', 'top right'];
    window.drops = {};
    for (_i = 0, _len = positions.length; _i < _len; _i++) {
      position = positions[_i];
      drops[position] = new Drop({
        target: $target[0],
        className: 'drop-theme-arrows',
        attach: position,
        constrainToScrollParent: true,
        trigger: 'manual',
        content: $.map(position.split(' '), function(word) {
          return word.substr(0, 1).toUpperCase() + word.substr(1);
        }).join(' ')
      });
      drops[position].$drop.addClass("drop-attached-" + (position.replace(' ', '-')));
    }
    openIndex = 0;
    frames = 0;
    frameLengthMS = 10;
    openAllDrops = function() {
      var drop, _results;
      _results = [];
      for (position in drops) {
        drop = drops[position];
        _results.push(drop.open());
      }
      return _results;
    };
    openNextDrop = function() {
      var drop;
      for (position in drops) {
        drop = drops[position];
        drop.close();
      }
      drops[positions[openIndex]].open();
      openIndex = (openIndex + 1) % positions.length;
      if (frames > 20) {
        return openAllDrops();
      }
      frames += 1;
      return setTimeout(openNextDrop, frameLengthMS * frames);
    };
    return openNextDrop();
  };

  init();

}).call(this);
