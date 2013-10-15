(function() {
  var $, defaults, isIE, methods, pluginName;
  pluginName = 'drop';
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
      return /fixed/.test(this.css('position')) || (!scrollParent.length ? $(document) : scrollParent);
    }
  });
  defaults = {
    trigger: 'click'
  };
  methods = {
    init: function(opts) {
      return this.each(function() {
        var $el, options;
        $el = $(this);
        options = $.extend({}, defaults, opts);
        $el.data(pluginName, options);
        return $el[pluginName]('drop');
      });
    },
    drop: function() {
      var $el, options;
      $el = $(this);
      options = $el.data(pluginName);
      $el[pluginName]('setupDrop');
      $el[pluginName]('setupEvents');
      return $el[pluginName]('positionDrop');
    },
    setupDrop: function() {
      var $el, options;
      $el = $(this);
      options = $el.data(pluginName);
      options.$drop = $('<div class="drop" style="display: none; background: pink; position: absolute; padding: 20px">stuff</div>');
      $('body').append(options.$drop);
      return $el;
    },
    setupEvents: function() {
      var $el, $scrollParent, options;
      $el = $(this);
      options = $el.data(pluginName);
      $scrollParent = $el.scrollParent();
      $scrollParent.bind('scroll.drop', function() {
        return $el[pluginName]('positionDrop');
      });
      if (options.trigger === 'click') {
        $el.bind('click.drop', function() {
          return $el[pluginName]('toggleDrop');
        });
        $scrollParent.bind('click.drop', function(event) {
          if ($(event.target).is($el[0]) || $el.find(event.target).length) {
            return;
          }
          return $el[pluginName]('hideDrop');
        });
      }
      return $el;
    },
    toggleDrop: function() {
      var $el, options;
      $el = $(this);
      options = $el.data(pluginName);
      if (options.$drop.is(':hidden')) {
        $el[pluginName]('showDrop');
      } else {
        $el[pluginName]('hideDrop');
      }
      return $el;
    },
    showDrop: function() {
      var $el, options;
      $el = $(this);
      options = $el.data(pluginName);
      options.$drop.show();
      return $el;
    },
    hideDrop: function() {
      var $el, options;
      $el = $(this);
      options = $el.data(pluginName);
      options.$drop.hide();
      return $el;
    },
    positionDrop: function() {
      var $el, $scrollParent, options, scrollParentOffset, targetOffset;
      $el = $(this);
      options = $el.data(pluginName);
      targetOffset = $el.offset();
      $scrollParent = $el.scrollParent();
      scrollParentOffset = $scrollParent.offset();
      options.$drop.css({
        top: Math.min(Math.max(targetOffset.top + $el.outerHeight(), scrollParentOffset.top), scrollParentOffset.top + $scrollParent.outerHeight() - options.$drop.outerHeight()),
        left: Math.min(Math.max(targetOffset.left, scrollParentOffset.left), scrollParentOffset.left + $scrollParent.outerWidth() - options.$drop.outerWidth())
      });
      return $el;
    }
  };
  $.fn[pluginName] = function(options) {
    if (methods[options]) {
      return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof options === 'object' || !options) {
      return methods.init.apply(this, arguments);
    } else {
      return $.error("jQuery." + pluginName + ": Method " + options + " does not exist");
    }
  };
}).call(this);
