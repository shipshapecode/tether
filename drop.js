(function() {
  /*
  
  Drop - Finally a dropdown which understands where it is.
  
      - Attach to 8 different locations
      - Attach options diagram:
  
              topLeft  topRight
                   |    |
         leftTop --TARGET-- rightTop
      leftBottom --TARGET-- rightBottom
                   |    |
            bottomLeft bottomRight
  
  */
  var $, debounce, drop, isIE, jQueryMethods;
  $ = jQuery;
  isIE = !!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase());
  $.fn.extend({
    scrollParent: function() {
      var scrollParent;
      scrollParent = void 0;
      if ((isIE && /(static|relative)/.test(this.css('position'))) || /absolute/.test(this.css('position'))) {
        scrollParent = this.parents().filter(function() {
          return /(relative|absolute|fixed)/.test($.css(this, 'position')) && /(auto|scroll)/.test($.css(this, 'overflow') + $.css(this, 'overflow-y') + $.css(this, 'overflow-x'));
        }).eq(0);
      } else {
        scrollParent = this.parents().filter(function() {
          return /(auto|scroll)/.test($.css(this, 'overflow') + $.css(this, 'overflow-y') + $.css(this, 'overflow-x'));
        }).eq(0);
      }
      return /fixed/.test(this.css('position')) || (!scrollParent.length ? $('html') : scrollParent);
    }
  });
  debounce = 0;
  if (isIE) {
    debounce = 100;
  }
  $(function() {
    var resizePending;
    drop.updateBodyClasses();
    $(document).on('openDrop.drop, closeDrop.drop', function(event) {
      return drop.updateBodyClasses();
    });
    resizePending = false;
    return $(window).on('resize', function() {
      if (resizePending) {
        return;
      }
      resizePending = true;
      return setTimeout(function() {
        resizePending = false;
        return $.each(drop.dropTargets, function(i, $target) {
          if ($target.drop('isOpened')) {
            return $target.drop('positionDrop');
          }
        });
      }, debounce);
    });
  });
  drop = {
    baseClassNames: {
      drop: 'drop',
      opened: 'drop-opened',
      closed: 'drop-closed',
      allClosed: 'drop-all-closed'
    },
    defaults: {
      attach: 'bottomLeft',
      trigger: 'click',
      constrainToScrollParent: true,
      constrainToWindow: true,
      className: '',
      closedOnInit: true,
      dropTag: 'div',
      content: 'drop'
    },
    dropTargets: [],
    updateBodyClasses: function() {
      var anyOpen;
      anyOpen = false;
      $.each(drop.dropTargets, function(i, $target) {
        if ($target.drop('isOpened')) {
          return anyOpen = true;
        }
      });
      if (anyOpen) {
        return $('body').addClass(drop.baseClassNames.opened).removeClass(drop.baseClassNames.allClosed);
      } else {
        return $('body').removeClass(drop.baseClassNames.opened).addClass(drop.baseClassNames.allClosed);
      }
    }
  };
  jQueryMethods = {
    init: function(opts) {
      return this.each(function() {
        var $target, options;
        $target = $(this);
        options = $.extend({}, drop.defaults, opts);
        $target.data('drop', options);
        drop.dropTargets.push($target);
        return $target.drop('drop');
      });
    },
    drop: function() {
      var $target, options;
      $target = $(this);
      options = $target.data().drop;
      $target.drop('setupDrop');
      return $target.drop('setupEvents');
    },
    setupDrop: function() {
      var $target, options;
      $target = $(this);
      options = $target.data().drop;
      options.$drop = $(document.createElement(options.dropTag));
      options.$drop.addClass(drop.baseClassNames.drop);
      options.$drop.addClass(options.className);
      if (options.closedOnInit) {
        options.$drop.addClass(drop.baseClassNames.closed);
      }
      options.$drop.append(options.content);
      $('body').append(options.$drop);
      return $target;
    },
    setupEvents: function() {
      var $scrollParent, $target, options;
      $target = $(this);
      options = $target.data().drop;
      $scrollParent = $target.scrollParent();
      $scrollParent.bind('scroll.drop', function() {
        return $target.drop('positionDrop');
      });
      $(window).bind('scroll.drop', function() {
        return $target.drop('positionDrop');
      });
      if (options.trigger === 'click') {
        $target.bind('click.drop', function() {
          return $target.drop('toggleDrop');
        });
        $(document).bind('click.drop', function(event) {
          if (!$target.drop('isOpened')) {
            return;
          }
          if ($(event.target).is(options.$drop[0]) || options.$drop.find(event.target).length) {
            return;
          }
          if ($(event.target).is($target[0]) || $target.find(event.target).length) {
            return;
          }
          return $target.drop('closeDrop');
        });
      }
      return $target;
    },
    toggleDrop: function() {
      var $target, options;
      $target = $(this);
      options = $target.data().drop;
      if ($target.drop('isOpened')) {
        $target.drop('closeDrop');
      } else {
        $target.drop('openDrop');
      }
      return $target;
    },
    isOpened: function() {
      return $(this).data().drop.$drop.hasClass(drop.baseClassNames.opened);
    },
    openDrop: function() {
      var $target, options;
      $target = $(this);
      options = $target.data().drop;
      $target.drop('positionDrop');
      options.$drop.addClass(drop.baseClassNames.opened).removeClass(drop.baseClassNames.closed);
      $(document).trigger({
        type: 'openDrop',
        $drop: $target
      });
      return $target;
    },
    closeDrop: function() {
      var $target, options;
      $target = $(this);
      options = $target.data().drop;
      options.$drop.addClass(drop.baseClassNames.closed).removeClass(drop.baseClassNames.opened);
      $(document).trigger({
        type: 'closeDrop',
        $drop: $target
      });
      return $target;
    },
    positionDrop: function() {
      var $scrollParent, $target, dropOuterHeight, dropOuterWidth, left, oldLeft, oldTop, options, scrollParentOffset, targetOffset, targetOuterHeight, targetOuterWidth, top, windowConstrainedTop, windowScrollLeft, windowScrollTop, _ref, _ref10, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9;
      $target = $(this);
      options = $target.data().drop;
      targetOffset = $target.offset();
      $scrollParent = $target.scrollParent();
      scrollParentOffset = $scrollParent.offset();
      targetOuterHeight = $target.outerHeight();
      targetOuterWidth = $target.outerWidth();
      dropOuterHeight = options.$drop.outerHeight();
      dropOuterWidth = options.$drop.outerWidth();
      windowScrollTop = $(window).scrollTop();
      windowScrollLeft = $(window).scrollLeft();
      if ((_ref = options.attach) === 'bottomLeft' || _ref === 'bottomRight') {
        top = targetOffset.top + targetOuterHeight;
      }
      if ((_ref2 = options.attach) === 'topLeft' || _ref2 === 'topRight') {
        top = targetOffset.top - dropOuterHeight;
      }
      if ((_ref3 = options.attach) === 'bottomLeft' || _ref3 === 'topLeft') {
        left = targetOffset.left;
      }
      if ((_ref4 = options.attach) === 'bottomRight' || _ref4 === 'topRight') {
        left = targetOffset.left + targetOuterWidth - dropOuterWidth;
      }
      if ((_ref5 = options.attach) === 'rightTop' || _ref5 === 'rightBottom') {
        left = targetOffset.left + targetOuterWidth;
      }
      if ((_ref6 = options.attach) === 'leftTop' || _ref6 === 'leftBottom') {
        left = targetOffset.left - dropOuterWidth;
      }
      if ((_ref7 = options.attach) === 'rightTop' || _ref7 === 'leftTop') {
        top = targetOffset.top;
      }
      if ((_ref8 = options.attach) === 'rightBottom' || _ref8 === 'leftBottom') {
        top = targetOffset.top + targetOuterHeight - dropOuterHeight;
      }
      if (options.constrainToScrollParent) {
        top = Math.min(Math.max(top, scrollParentOffset.top), scrollParentOffset.top + $scrollParent.outerHeight() - dropOuterHeight);
        left = Math.min(Math.max(left, scrollParentOffset.left), scrollParentOffset.left + $scrollParent.outerWidth() - dropOuterWidth);
      }
      if (options.constrainToWindow) {
        windowConstrainedTop = Math.min(Math.max(top, windowScrollTop), $(window).height() + windowScrollTop - dropOuterHeight);
        left = Math.min(Math.max(left, windowScrollLeft), $(window).width() + windowScrollLeft - dropOuterWidth);
        if (top !== windowConstrainedTop) {
          if ((_ref9 = options.attach) === 'bottomLeft' || _ref9 === 'bottomRight') {
            top = targetOffset.top - dropOuterHeight;
          }
          if ((_ref10 = options.attach) === 'topLeft' || _ref10 === 'topRight') {
            top = targetOffset.top + targetOuterHeight;
          }
        }
      }
      oldTop = parseInt(options.$drop.css('top'), 10);
      oldLeft = parseInt(options.$drop.css('left'), 10);
      if (oldTop === top && oldLeft === left) {
        return $target;
      }
      options.$drop[0].style.top = top + 'px';
      options.$drop[0].style.left = left + 'px';
      return $target;
    }
  };
  window.drop = drop;
  $.fn.drop = function(options) {
    if (jQueryMethods[options]) {
      return jQueryMethods[options].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof options === 'object' || !options) {
      return jQueryMethods.init.apply(this, arguments);
    } else {
      return $.error("jQuery.drop: Method " + options + " does not exist");
    }
  };
}).call(this);
