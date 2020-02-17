import { useRef, useCallback } from 'react';
import { ExtractTypeOf } from 'base/type';

export function useRefFactory<T>(factory: () => T): React.MutableRefObject<T> {
  const ref = useRef<T | null>(null);
  if (!ref.current) ref.current = factory();
  return ref as React.MutableRefObject<T>;
}

export function useMethod<T, K extends ExtractTypeOf<T, Function>>(
  service: T,
  methodName: K
): T[K] {
  const method: Function = service[methodName];
  return useCallback<T[K]>(method.bind(service), [service, method]);
}
