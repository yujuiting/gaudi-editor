export function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null;
}

export function get<T>(from: object, path: string | string[]): T | undefined;
export function get<T>(from: object, path: string | string[], defaultValue: T): T;
export function get<T>(from: object, path: string | string[], defaultValue?: T) {
  const paths = typeof path === 'string' ? path.split('.') : path;
  let current: unknown = from;
  for (const key of paths) {
    if (isObject(current)) {
      current = (current as any)[key];
    } else {
      return defaultValue;
    }
  }
  return typeof current !== void 0 ? current : defaultValue;
}

/**
 * if target parent is not an object, it will perform a hard write.
 */
export function set<T>(to: object, path: string | string[], value: T) {
  const paths = typeof path === 'string' ? path.split('.') : path;
  const lastKey = paths.pop();
  if (!lastKey) throw new Error();
  let current: unknown = to;
  for (const key of paths) {
    if (!isObject((current as any)[key])) {
      (current as any)[key] = {};
    }
    (current as any)[key] = { ...(current as any)[key] };
    current = (current as any)[key];
  }
  (current as any)[lastKey] = value;
}

export function keys<T>(obj: T): Array<keyof T> {
  return Object.keys(obj) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
}
