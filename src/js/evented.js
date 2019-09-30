import { isUndefined } from './utils/type-check';

export class Evented {
  on(event, handler, ctx, once = false) {
    if (isUndefined(this.bindings)) {
      this.bindings = {};
    }
    if (isUndefined(this.bindings[event])) {
      this.bindings[event] = [];
    }
    this.bindings[event].push({ handler, ctx, once });

    return this;
  }

  once(event, handler, ctx) {
    return this.on(event, handler, ctx, true);
  }

  off(event, handler) {
    if (isUndefined(this.bindings) ||
      isUndefined(this.bindings[event])) {
      return this;
    }

    if (isUndefined(handler)) {
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
    if (!isUndefined(this.bindings) && this.bindings[event]) {
      let i = 0;
      while (i < this.bindings[event].length) {
        const { handler, ctx, once } = this.bindings[event][i];

        let context = ctx;
        if (isUndefined(context)) {
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
