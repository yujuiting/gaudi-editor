export function pipe<T>(...fns: ((arg: T) => T)[]) {
  return (arg: T): T => {
    let result = arg;
    for (const fn of fns) {
      result = fn(result);
    }
    return result;
  };
}
