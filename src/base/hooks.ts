import { useRef } from 'react';

export function useRefFactory<T>(factory: () => T): React.MutableRefObject<T> {
  const ref = useRef<T | null>(null);
  if (!ref.current) ref.current = factory();
  return ref as React.MutableRefObject<T>;
}
