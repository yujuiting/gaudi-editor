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
      current = (current as any)[key]; // eslint-disable-line @typescript-eslint/no-explicit-any
    } else {
      return defaultValue;
    }
  }
  return typeof current !== void 0 ? current : defaultValue;
}

export function set<T extends object>(to: T, path: string | string[], value: unknown) {
  const paths = typeof path === 'string' ? path.split('.') : path;
  const lastKey = paths.pop();
  if (!lastKey) throw new Error();
  const result = to;
  let current: any = result; // eslint-disable-line @typescript-eslint/no-explicit-any
  for (const key of paths) {
    if (!isObject(current[key])) {
      current[key] = {};
    }
    current[key] = { ...current[key] };
    current = current[key];
  }
  current[lastKey] = value;
}

export function clone(value: any) {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  if (typeof value !== 'object') throw new Error();
  if (value === null) throw new Error();
  const result: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
  for (const key in value) {
    if (typeof value[key] !== 'object') result[key] = value[key];
    else result[key] = clone(value[key]);
  }
  return result;
}

export function keys<T>(obj: T): Array<keyof T> {
  return Object.keys(obj) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function fromMap<K, V>(map: Map<K, V>): Record<string, V> {
  const result = {} as Record<string, V>;
  for (const [k, v] of map) {
    result[`${k}`] = v;
  }
  return result;
}

type NotNull<T> = T extends null ? never : T;

export function notNull<T>(value: T | null): value is NotNull<T> {
  return value !== null;
}
