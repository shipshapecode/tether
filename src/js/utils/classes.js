import { isUndefined } from './type-check';

export function addClass(el, name) {
  name.split(' ').forEach((cls) => {
    if (cls.trim()) {
      el.classList.add(cls);
    }
  });
}

/**
 * Get class string based on previously determined classes
 * @param  {String} [key=''] - default value for the classes object
 * @param  {Object} classes
 * @param  {String} classPrefix
 */
export function getClass(key = '', classes, classPrefix) {
  if (!isUndefined(classes) && !isUndefined(classes[key])) {
    if (classes[key] === false) {
      return '';
    }
    return classes[key];
  } else if (classPrefix) {
    return `${classPrefix}-${key}`;
  } else {
    return key;
  }
}

export function removeClass(el, name) {
  name.split(' ').forEach((cls) => {
    if (cls.trim()) {
      el.classList.remove(cls);
    }
  });
}

export function updateClasses(el, add, all) {
  // Of the set of 'all' classes, we need the 'add' classes, and only the
  // 'add' classes to be set.
  all.forEach((cls) => {
    if (add.indexOf(cls) === -1 && el.classList.contains(cls)) {
      removeClass(el, cls);
    }
  });

  add.forEach((cls) => {
    if (!el.classList.contains(cls)) {
      addClass(el, cls);
    }
  });
}
