import { JsonObject } from '@angular-devkit/core';

export const isCommonObject = (item: any): boolean => {
  return (item !== null && typeof item === 'object');
}

export const isObject = (item: any): boolean => {
  return (isCommonObject(item) && !Array.isArray(item));
}

export const mergeDeep = (target: any, ...sources: any[]): any => {
  if (!sources.length) {
    return target;
  }

  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        target[key] = target[key] || {};
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

export const traverse = (data: JsonObject, fn: Function): void => {
  for (const [key, value] of Object.entries(data)) {
    fn.apply(null, [key, value, data]);

    if (isCommonObject(value)) {
      traverse(value as JsonObject, fn);
    }
  }
}