import { useRef, useCallback } from 'react';
import { ExtractTypeOf } from 'base/type';

export function useRefFactory<T>(factory: () => T): React.MutableRefObject<T> {
  const ref = useRef<T | null>(null);
  if (!ref.current) ref.current = factory();
  return ref as React.MutableRefObject<T>;
}

export function useMethod<T, K extends ExtractTypeOf<T, Function>, P extends Parameters<T[K]>>(
  service: T,
  methodName: K,
  args?: P
): T[K] {
  const method: Function = service[methodName];
  const fn = args ? method.bind(service, ...args) : method.bind(service);
  const deps = args ? [service, method, ...args] : [service, method];
  return useCallback<T[K]>(fn, deps);
}

export function useDebounce(fn: Function, timeout = 0) {
  const timer = useRef(0);

  return useCallback(
    (...args: unknown[]) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => fn(...args), timeout);
    },
    [fn, timer, timeout]
  );
}
