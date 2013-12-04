(function() {
  var MIRROR_LR, MIRROR_TB, OFFSET_MAP, Tether, addOffset, attachmentToOffset, autoToFixedAttachment, isIE, offsetToPx, parseAttachment, parseOffset, position, scrollParent, tethers,
    __slice = [].slice;

  isIE = /msie [\w.]+/.test(navigator.userAgent.toLowerCase());

  scrollParent = function($el) {
    var position;
    position = $el.css('position');
    if (position === 'fixed') {
      return true;
    }
    scrollParent = void 0;
    if (position === 'absolute' || (isIE && (position === 'static' || position === 'relative'))) {
      scrollParent = $el.parents().filter(function() {
        var _ref;
        return ((_ref = $.css(this, 'position')) === 'relative' || _ref === 'absolute' || _ref === 'fixed') && /(auto|scroll)/.test($.css(this, 'overflow') + $.css(this, 'overflow-y') + $.css(this, 'overflow-x'));
      }).first();
    } else {
      scrollParent = $el.parents().filter(function() {
        return /(auto|scroll)/.test($.css(this, 'overflow') + $.css(this, 'overflow-y') + $.css(this, 'overflow-x'));
      }).first();
    }
    if (scrollParent.length) {
      return scrollParent;
    } else {
      return $('html');
    }
  };

  tethers = [];

  position = function() {
    var tether, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = tethers.length; _i < _len; _i++) {
      tether = tethers[_i];
      _results.push(tether.position());
    }
    return _results;
  };

  $(window).on('resize', position);

  $(window).on('scroll.drop', position);

  MIRROR_LR = {
    middle: 'middle',
    left: 'right',
    right: 'left'
  };

  MIRROR_TB = {
    middle: 'middle',
    top: 'bottom',
    bottom: 'top'
  };

  OFFSET_MAP = {
    top: '0',
    left: '0',
    middle: '50%',
    bottom: '100%',
    right: '100%'
  };

  autoToFixedAttachment = function(attachment, relativeToAttachment) {
    var left, top;
    left = attachment.left, top = attachment.top;
    if (left === 'auto') {
      left = MIRROR_LR[relativeToAttachment.left];
    }
    if (top === 'auto') {
      top = MIRROR_TB[relativeToAttachment.top];
    }
    return {
      left: left,
      top: top
    };
  };

  attachmentToOffset = function(attachment) {
    var _ref, _ref1;
    return {
      left: (_ref = OFFSET_MAP[attachment.left]) != null ? _ref : attachment.left,
      top: (_ref1 = OFFSET_MAP[attachment.top]) != null ? _ref1 : attachment.top
    };
  };

  addOffset = function() {
    var left, offsets, out, top, _i, _len, _ref;
    offsets = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    out = {
      top: 0,
      left: 0
    };
    for (_i = 0, _len = offsets.length; _i < _len; _i++) {
      _ref = offsets[_i], top = _ref.top, left = _ref.left;
      if (typeof top === 'string') {
        top = parseFloat(top, 10);
      }
      if (typeof left === 'string') {
        left = parseFloat(left, 10);
      }
      out.top += top;
      out.left += left;
    }
    return out;
  };

  offsetToPx = function(offset, element) {
    if (typeof offset.left === 'string' && offset.left.indexOf('%') !== -1) {
      offset.left = parseFloat(offset.left, 10) / 100 * $(element).width();
    }
    if (typeof offset.top === 'string' && offset.top.indexOf('%') !== -1) {
      offset.top = parseFloat(offset.top, 10) / 100 * $(element).height();
    }
    return offset;
  };

  parseAttachment = parseOffset = function(value) {
    var left, top, _ref;
    _ref = value.split(' '), top = _ref[0], left = _ref[1];
    return {
      top: top,
      left: left
    };
  };

  Tether = (function() {
    function Tether(options) {
      var _ref,
        _this = this;
      this.options = options;
      _ref = this.options, this.element = _ref.element, this.target = _ref.target;
      this.$element = $(this.element);
      this.$target = $(this.target);
      this.targetAttachment = parseAttachment(this.options.targetAttachment);
      this.attachment = parseAttachment(this.options.attachment);
      this.offset = parseOffset(this.options.offset);
      this.targetOffset = parseOffset(this.options.targetOffset);
      this.scrollParent = scrollParent($(this.target));
      this.scrollParent.on('scroll', (function() {
        return _this.position();
      }));
      tethers.push(this);
      this.history = [];
      this.position();
    }

    Tether.prototype.position = function() {
      var elementPos, height, left, next, offset, targetAttachment, targetOffset, targetPos, top, width;
      targetAttachment = autoToFixedAttachment(this.targetAttachment, this.attachment);
      offset = offsetToPx(attachmentToOffset(this.attachment), this.element);
      targetOffset = offsetToPx(attachmentToOffset(targetAttachment), this.target);
      offset = addOffset(offset, offsetToPx(this.offset, this.element));
      targetOffset = addOffset(targetOffset, offsetToPx(this.targetOffset, this.target));
      targetPos = this.$target.offset();
      elementPos = this.$element.offset();
      left = targetPos.left + targetOffset.left - offset.left;
      top = targetPos.top + targetOffset.top - offset.top;
      width = this.$element.outerWidth();
      height = this.$element.outerHeight();
      next = {
        page: {
          top: top,
          bottom: document.body.scrollHeight - top - height,
          left: left,
          right: document.body.scrollWidth - left - width
        },
        viewport: {
          top: top - pageYOffset,
          bottom: pageYOffset - top - height + innerHeight,
          left: left - pageXOffset,
          right: pageXOffset - left - width + innerWidth
        }
      };
      if (this.history.length) {
        this.move(next);
      }
      this.history.unshift(next);
      if (this.history.length > 3) {
        return this.history.pop();
      }
    };

    Tether.prototype.move = function(position) {
      var css, found, key, point, same, transcribe, type, val, write, _i, _len, _ref;
      same = {};
      for (type in position) {
        same[type] = {};
        for (key in position[type]) {
          found = false;
          _ref = this.history;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            point = _ref[_i];
            if (point[type][key] !== position[type][key]) {
              found = true;
              break;
            }
          }
          if (!found) {
            same[type][key] = true;
          }
        }
      }
      css = {};
      transcribe = function(same, pos) {
        if (same.top) {
          css.top = "" + pos.top + "px";
        } else {
          css.bottom = "" + pos.bottom + "px";
        }
        if (same.left) {
          return css.left = "" + pos.left + "px";
        } else {
          return css.right = "" + pos.right + "px";
        }
      };
      if ((same.page.top || same.page.bottom) && (same.page.left || same.page.right)) {
        css.position = 'absolute';
        transcribe(same.page, position.page);
      } else if ((same.viewport.top || same.viewport.bottom) && (same.viewport.left || same.viewport.right)) {
        css.position = 'fixed';
        transcribe(same.viewport, position.viewport);
      } else {
        css.position = 'absolute';
        css.top = "" + position.page.top + "px";
        css.left = "" + position.page.left + "px";
      }
      write = false;
      for (key in css) {
        val = css[key];
        if (this.$element.css(key) !== val) {
          write = true;
          break;
        }
      }
      if (write) {
        return this.$element.css(css);
      }
    };

    return Tether;

  })();

  window.Tether = Tether;

}).call(this);
