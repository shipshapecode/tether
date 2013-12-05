/*

drop - Finally a dropdown which understands where it is.

    - Attach to 8 different locations
    - Attach options diagram:

           top-left  top-right
                 |    |
      left-top --TARGET-- right-top
   left-bottom --TARGET-- right-bottom
                 |    |
         bottom-left bottom-right
*/


(function() {
  var $, MIRROR_ATTACH, allDrops, createContext, sortAttach;

  $ = jQuery;

  sortAttach = function(str) {
    var first, second, _ref, _ref1;
    _ref = str.split(' '), first = _ref[0], second = _ref[1];
    if (first === 'left' || first === 'right') {
      _ref1 = [second, first], first = _ref1[0], second = _ref1[1];
    }
    return [first, second].join(' ');
  };

  MIRROR_ATTACH = {
    left: 'right',
    right: 'left',
    top: 'bottom',
    bottom: 'top',
    middle: 'middle'
  };

  allDrops = [];

  createContext = function(options) {
    var DropInstance, defaults, drop;
    drop = function() {
      return (function(func, args, ctor) {
        ctor.prototype = func.prototype;
        var child = new ctor, result = func.apply(child, args);
        return Object(result) === result ? result : child;
      })(DropInstance, arguments, function(){});
    };
    $.extend(drop, {
      createContext: createContext,
      drops: []
    });
    defaults = {
      classNames: {
        drop: 'drop',
        dropContent: 'drop-content',
        opened: 'drop-opened',
        closed: 'drop-closed',
        allClosed: 'drop-all-closed',
        attachPrefix: 'drop-attached-'
      },
      defaults: {
        attach: 'bottom left',
        trigger: 'click',
        constrainToScrollParent: true,
        constrainToWindow: true,
        className: '',
        closedOnInit: true,
        content: 'drop'
      }
    };
    $.extend(true, drop, defaults, options);
    $(document).on('dropopen.drop, dropclose.drop', function() {
      return drop.updateBodyClasses();
    });
    drop.updateBodyClasses = function() {
      var anyOpen, _drop, _i, _len;
      anyOpen = false;
      for (_i = 0, _len = allDrops.length; _i < _len; _i++) {
        _drop = allDrops[_i];
        if (!(_drop.isOpened())) {
          continue;
        }
        anyOpen = true;
        break;
      }
      if (anyOpen) {
        return $('body').addClass(drop.classNames.opened).removeClass(drop.classNames.allClosed);
      } else {
        return $('body').removeClass(drop.classNames.opened).addClass(drop.classNames.allClosed);
      }
    };
    DropInstance = (function() {
      function DropInstance(options) {
        this.options = options;
        this.options = $.extend({}, this.options.defaults, this.options);
        this.$target = $(this.options.target);
        drop.drops.push(this);
        allDrops.push(this);
        this.setupElements();
        this.setupEvents();
        this.setupTether();
      }

      DropInstance.prototype.setupElements = function() {
        this.$drop = $('<div>');
        this.$drop.addClass(drop.classNames.drop);
        this.$drop.addClass(this.options.className);
        this.$dropContent = $('<div>');
        this.$dropContent.addClass(drop.classNames.dropContent);
        this.$dropContent.append(this.options.content);
        this.$drop.append(this.$dropContent);
        return this.$drop.addClass(drop.classNames.closed);
      };

      DropInstance.prototype.setupTether = function() {
        var constraints, dropAttach;
        dropAttach = this.options.attach.split(' ');
        dropAttach[0] = MIRROR_ATTACH[dropAttach[0]];
        dropAttach = dropAttach.join(' ');
        constraints = [];
        if (this.options.constrainToScrollParent) {
          constraints.push({
            to: 'scrollParent',
            pin: true,
            changeAttachment: true,
            changeTargetAttachment: false
          });
        }
        if (this.options.constrainToWindow) {
          constraints.push({
            to: 'window',
            pin: true,
            changeAttachment: true,
            changeTargetAttachment: false
          });
        }
        return this.tether = new Tether({
          element: this.$drop[0],
          target: this.$target[0],
          attachment: sortAttach(dropAttach),
          targetAttachment: sortAttach(this.options.attach),
          offset: '0 0',
          targetOffset: '0 0',
          enabled: false,
          constraints: constraints
        });
      };

      DropInstance.prototype.setupEvents = function() {
        var _this = this;
        if (this.options.trigger === 'click') {
          this.$target.bind('click.drop', function() {
            return _this.toggle();
          });
          return $(document).bind('click.drop', function(event) {
            if (!_this.isOpened) {
              return;
            }
            if ($(event.target).is(_this.$drop[0]) || _this.$drop.find(event.target).length) {
              return;
            }
            if ($(event.target).is(_this.$target[0]) || _this.$target.find(event.target).length) {
              return;
            }
            return _this.close();
          });
        }
      };

      DropInstance.prototype.isOpened = function() {
        return this.$drop.hasClass(drop.classNames.opened);
      };

      DropInstance.prototype.toggle = function() {
        if (this.isOpened()) {
          return this.close();
        } else {
          return this.open();
        }
      };

      DropInstance.prototype.open = function() {
        if (!this.$drop.parent().length) {
          $('body').append(this.$drop);
        }
        this.$target.addClass(drop.classNames.opened).removeClass(drop.classNames.closed);
        this.$drop.addClass(drop.classNames.opened).removeClass(drop.classNames.closed);
        this.$drop.trigger({
          type: 'dropopen',
          drop: this
        });
        return this.tether.enable();
      };

      DropInstance.prototype.close = function() {
        this.$target.addClass(drop.classNames.closed).removeClass(drop.classNames.opened);
        this.$drop.addClass(drop.classNames.closed).removeClass(drop.classNames.opened);
        this.$drop.trigger({
          type: 'dropclose',
          drop: this
        });
        return this.tether.disable();
      };

      return DropInstance;

    })();
    return drop;
  };

  window.Drop = createContext();

  $(function() {
    return Drop.updateBodyClasses();
  });

}).call(this);
