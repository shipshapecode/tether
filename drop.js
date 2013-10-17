(function() {
  /*
  
  Drop - Finally a dropdown which understands where it is.
  
      - Attach to 8 different locations
      - Attach options diagram:
  
             top-left  top-right
                   |    |
        left-top --TARGET-- right-top
     left-bottom --TARGET-- right-bottom
                   |    |
           bottom-left bottom-right
  
  */
  var $, debounce, drop, isIE, jQueryMethods;
  $ = jQuery;
  isIE = !!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase());
  debounce = isIE ? 100 : 0;
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
  $.fn.removeClassPrefix = function(prefix) {
    return $(this).attr('class', function(index, className) {
      return className.replace(new RegExp("\\b" + prefix + "\\S+", 'g'), '');
    });
  };
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
      allClosed: 'drop-all-closed',
      attachPrefix: 'drop-attached-'
    },
    defaults: {
      attach: 'bottom-left',
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
        var $target, attachSplit, options;
        $target = $(this);
        drop.dropTargets.push($target);
        options = $.extend({}, drop.defaults, opts);
        if (options.attach && !(options.attachFirst || options.attachSecond)) {
          attachSplit = options.attach.split('-');
          options.attachFirst = attachSplit[0];
          options.attachSecond = attachSplit[1];
        }
        $target.data('drop', options);
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
      $target.drop('attach', options.attachFirst, options.attachSecond);
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
      $target.addClass(drop.baseClassNames.opened).removeClass(drop.baseClassNames.closed);
      options.$drop.trigger({
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
      $target.addClass(drop.baseClassNames.closed).removeClass(drop.baseClassNames.opened);
      options.$drop.trigger({
        type: 'closeDrop',
        $drop: $target
      });
      return $target;
    },
    attach: function(attachFirst, attachSecond) {
      var $target, options;
      $target = $(this);
      options = $target.data().drop;
      return $([$target[0], options.$drop[0]]).each(function() {
        return $(this).removeClassPrefix(drop.baseClassNames.attachPrefix).addClass("" + drop.baseClassNames.attachPrefix + attachFirst + "-" + attachSecond);
      });
    },
    positionDrop: function() {
      var $scrollParent, $target, dropOuterHeight, dropOuterWidth, left, leftMax, leftMin, oldLeft, oldTop, options, scrollParentOffset, targetOffset, targetOuterHeight, targetOuterWidth, top, topMax, topMin, wasConstrained, windowScrollLeft, windowScrollTop, _ref, _ref2;
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
      if (options.attachFirst === 'bottom') {
        top = targetOffset.top + targetOuterHeight;
      }
      if (options.attachFirst === 'top') {
        top = targetOffset.top - dropOuterHeight;
      }
      if (options.attachSecond === 'left') {
        left = targetOffset.left;
      }
      if (options.attachSecond === 'right') {
        left = targetOffset.left + targetOuterWidth - dropOuterWidth;
      }
      if (options.attachFirst === 'right') {
        left = targetOffset.left + targetOuterWidth;
      }
      if (options.attachFirst === 'left') {
        left = targetOffset.left - dropOuterWidth;
      }
      if (options.attachSecond === 'top') {
        top = targetOffset.top;
      }
      if (options.attachSecond === 'bottom') {
        top = targetOffset.top + targetOuterHeight - dropOuterHeight;
      }
      if (options.constrainToScrollParent && !$scrollParent.is('html')) {
        top = Math.min(Math.max(top, scrollParentOffset.top), scrollParentOffset.top + $scrollParent.outerHeight() - dropOuterHeight);
        left = Math.min(Math.max(left, scrollParentOffset.left), scrollParentOffset.left + $scrollParent.outerWidth() - dropOuterWidth);
      }
      if (options.constrainToWindow) {
        wasConstrained = false;
        topMin = windowScrollTop;
        topMax = $(window).height() + windowScrollTop - dropOuterHeight;
        leftMin = windowScrollLeft;
        leftMax = $(window).width() + windowScrollLeft - dropOuterWidth;
        if ((_ref = options.attachFirst) === 'top' || _ref === 'bottom') {
          if (top < topMin) {
            wasConstrained = true;
            top = topMin;
            top = targetOffset.top + targetOuterHeight;
            $target.drop('attach', 'bottom', options.attachSecond);
          }
          if (top > topMax) {
            wasConstrained = true;
            top = topMax;
            top = targetOffset.top - dropOuterHeight;
            $target.drop('attach', 'top', options.attachSecond);
          }
        }
        if ((_ref2 = options.attachFirst) === 'left' || _ref2 === 'right') {
          if (left < leftMin) {
            wasConstrained = true;
            left = leftMin;
            left = targetOffset.left + targetOuterWidth;
            $target.drop('attach', 'right', options.attachSecond);
          } else if (left > leftMax) {
            wasConstrained = true;
            left = leftMax;
            left = targetOffset.left - dropOuterWidth;
            $target.drop('attach', 'left', options.attachSecond);
          }
        }
        if (!wasConstrained) {
          $target.drop('attach', options.attachFirst, options.attachSecond);
        }
        top = Math.min(Math.max(top, topMin), topMax);
        left = Math.min(Math.max(left, leftMin), leftMax);
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
