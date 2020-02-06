export function shallowEqual<T>(a: T[], b: T[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((item, index) => item === b[index]);
}

export function unique<T>(a: T[]): T[] {
  return Array.from(new Set(a));
}

export const empty = [];
