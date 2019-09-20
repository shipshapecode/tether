const deferred = [];

export function defer(fn) {
  deferred.push(fn);
}

export function flush() {
  let fn;
  // eslint-disable-next-line
  while (fn = deferred.pop()) {
    fn();
  }
}
