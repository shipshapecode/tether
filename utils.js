(function() {
  var Evented, addClass, extend, getOffset, getOffsetParent, getOuterSize, getScrollParent, getSize, hasClass, removeClass,
    __hasProp = {}.hasOwnProperty,
    __slice = [].slice;

  if (window.Tether == null) {
    window.Tether = {};
  }

  getScrollParent = function(el) {
    var parent, position, scrollParent, style, _ref;
    position = getComputedStyle(el).position;
    if (position === 'fixed') {
      return el;
    }
    scrollParent = void 0;
    parent = el;
    while (parent = parent.parentNode) {
      if (!(style = getComputedStyle(parent))) {
        return parent;
      }
      if (/(auto|scroll)/.test(style['overflow'] + style['overflow-y'] + style['overflow-x'])) {
        if (position !== 'absolute' || ((_ref = style['position']) === 'relative' || _ref === 'absolute' || _ref === 'fixed')) {
          return parent;
        }
      }
    }
    return document.body;
  };

  getSize = function(el, outer) {
    var boxModel, dim, edge, edges, out, size, style, _i, _j, _k, _len, _len1, _len2, _ref;
    if (outer == null) {
      outer = false;
    }
    style = getComputedStyle(el);
    boxModel = style['box-sizing'];
    out = {};
    _ref = ['height', 'width'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      dim = _ref[_i];
      if (dim === 'height') {
        edges = ['top', 'bottom'];
      } else {
        edges = ['left', 'right'];
      }
      size = parseFloat(style[dim]);
      if (outer) {
        for (_j = 0, _len1 = edges.length; _j < _len1; _j++) {
          edge = edges[_j];
          if (boxModel !== 'border-box') {
            size += parseFloat(style["padding-" + edge]);
            size += parseFloat(style["border-" + edge + "-width"]);
          }
        }
      } else {
        for (_k = 0, _len2 = edges.length; _k < _len2; _k++) {
          edge = edges[_k];
          if (boxModel === 'border-box') {
            size -= parseFloat(style["padding-" + edge]);
            size -= parseFloat(style["border-" + edge + "-width"]);
          }
        }
      }
      out[dim] = size;
    }
    return out;
  };

  getOuterSize = function(el) {
    return getSize(el, true);
  };

  getOffset = function(el) {
    var box, doc;
    doc = el.ownerDocument.documentElement;
    box = el.getBoundingClientRect();
    return {
      top: box.top + window.pageYOffset - doc.clientTop,
      left: box.left + window.pageXOffset - doc.clientLeft
    };
  };

  getOffsetParent = function(el) {
    return el.offsetParent || document.documentElement;
  };

  extend = function(out) {
    var args, key, obj, val, _i, _len, _ref;
    if (out == null) {
      out = {};
    }
    args = [];
    Array.prototype.push.apply(args, arguments);
    _ref = args.slice(1);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      obj = _ref[_i];
      if (obj) {
        for (key in obj) {
          if (!__hasProp.call(obj, key)) continue;
          val = obj[key];
          out[key] = val;
        }
      }
    }
    return out;
  };

  removeClass = function(el, name) {
    var cls, _i, _len, _ref, _results;
    if (el.classList != null) {
      _ref = name.split(' ');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cls = _ref[_i];
        _results.push(el.classList.remove(cls));
      }
      return _results;
    } else {
      return el.className = el.className.replace(new RegExp("(^| )" + (name.split(' ').join('|')) + "( |$)", 'gi'), ' ');
    }
  };

  addClass = function(el, name) {
    var cls, _i, _len, _ref, _results;
    if (el.classList != null) {
      _ref = name.split(' ');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cls = _ref[_i];
        _results.push(el.classList.add(cls));
      }
      return _results;
    } else {
      removeClass(el, name);
      return el.className += " " + name;
    }
  };

  hasClass = function(el, name) {
    if (el.classList != null) {
      return el.classList.contains(name);
    } else {
      return new RegExp("(^| )" + name + "( |$)", 'gi').test(el.className);
    }
  };

  Evented = (function() {
    function Evented() {}

    Evented.prototype.on = function(event, handler, ctx, once) {
      var _base;
      if (once == null) {
        once = false;
      }
      if (this.bindings == null) {
        this.bindings = {};
      }
      if ((_base = this.bindings)[event] == null) {
        _base[event] = [];
      }
      return this.bindings[event].push({
        handler: handler,
        ctx: ctx,
        once: once
      });
    };

    Evented.prototype.once = function(event, handler, ctx) {
      return this.on(event, handler, ctx, true);
    };

    Evented.prototype.off = function(event, handler) {
      var i, _ref, _results;
      if (((_ref = this.bindings) != null ? _ref[event] : void 0) == null) {
        return;
      }
      if (handler == null) {
        return delete this.bindings[event];
      } else {
        i = 0;
        _results = [];
        while (i < this.bindings[event].length) {
          if (this.bindings[event][i].handler === handler) {
            _results.push(this.bindings[event].splice(i, 1));
          } else {
            _results.push(i++);
          }
        }
        return _results;
      }
    };

    Evented.prototype.trigger = function() {
      var args, ctx, event, handler, i, once, _ref, _ref1, _results;
      event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if ((_ref = this.bindings) != null ? _ref[event] : void 0) {
        i = 0;
        _results = [];
        while (i < this.bindings[event].length) {
          _ref1 = this.bindings[event][i], handler = _ref1.handler, ctx = _ref1.ctx, once = _ref1.once;
          handler.apply(ctx != null ? ctx : this, args);
          if (once) {
            _results.push(this.bindings[event].splice(i, 1));
          } else {
            _results.push(i++);
          }
        }
        return _results;
      }
    };

    return Evented;

  })();

  Tether.Utils = {
    getScrollParent: getScrollParent,
    getSize: getSize,
    getOuterSize: getOuterSize,
    getOffset: getOffset,
    getOffsetParent: getOffsetParent,
    extend: extend,
    addClass: addClass,
    removeClass: removeClass,
    hasClass: hasClass,
    Evented: Evented
  };

}).call(this);
