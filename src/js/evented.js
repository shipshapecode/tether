export class Evented {
  on(event, handler, ctx, once = false) {
    if (typeof this.bindings === 'undefined') {
      this.bindings = {};
    }
    if (typeof this.bindings[event] === 'undefined') {
      this.bindings[event] = [];
    }
    this.bindings[event].push({ handler, ctx, once });

    return this;
  }

  once(event, handler, ctx) {
    return this.on(event, handler, ctx, true);
  }

  off(event, handler) {
    if (typeof this.bindings === 'undefined' ||
      typeof this.bindings[event] === 'undefined') {
      return this;
    }

    if (typeof handler === 'undefined') {
      delete this.bindings[event];
    } else {
      let i = 0;
      while (i < this.bindings[event].length) {
        if (this.bindings[event][i].handler === handler) {
          this.bindings[event].splice(i, 1);
        } else {
          ++i;
        }
      }
    }

    return this;
  }

  trigger(event, ...args) {
    if (typeof this.bindings !== 'undefined' && this.bindings[event]) {
      let i = 0;
      while (i < this.bindings[event].length) {
        const { handler, ctx, once } = this.bindings[event][i];

        let context = ctx;
        if (typeof context === 'undefined') {
          context = this;
        }

        handler.apply(context, args);

        if (once) {
          this.bindings[event].splice(i, 1);
        } else {
          ++i;
        }
      }
    }

    return this;
  }
}
