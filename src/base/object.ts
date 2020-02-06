export function isObject(value: unknown): value is object {
  return typeof value === 'object' && value !== null;
}

// export function get<T>(from: object, path: string | string[]): T | undefined;
// export function get<T>(from: object, path: string | string[], defaultValue: T): T;
// export function get<T>(from: object, path: string | string[], defaultValue?: T) {
//   const paths = typeof path === 'string' ? path.split('.') : path;
//   let current: unknown = from;
//   for (const key of paths) {
//     if (isObject(current)) {
//       current = (current as any)[key];
//     } else {
//       return defaultValue;
//     }
//   }
//   return typeof current !== void 0 ? current : defaultValue;
// }

export function keys<T>(obj: T): Array<keyof T> {
  return Object.keys(obj) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
}
