export function extend(out = {}) {
  const args = [];

  Array.prototype.push.apply(args, arguments);

  args.slice(1).forEach((obj) => {
    if (obj) {
      for (let key in obj) {
        if ({}.hasOwnProperty.call(obj, key)) {
          out[key] = obj[key];
        }
      }
    }
  });

  return out;
}

export const uniqueId = (() => {
  let id = 0;
  return () => ++id;
})();
