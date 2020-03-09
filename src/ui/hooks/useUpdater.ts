import { useReducer, useEffect, useRef, useMemo } from 'react';
import { Observable } from 'rxjs';
import usePrevious from './usePrevious';

function useUpdater(): () => void {
  const [, update] = useReducer(c => c + 1, 0);
  return update;
}

export default useUpdater;

export function useObserver<T>(
  factory: () => Observable<T>,
  deps: React.DependencyList | undefined
) {
  const update = useUpdater();
  const observable = useMemo(factory, deps);
  const prev = usePrevious<Observable<T> | null>(null);
  const valueRef = useRef<T | null>(null);
  useEffect(() => {
    if (prev !== observable) {
      const subscription = observable.subscribe(value => {
        valueRef.current = value;
        update();
      });
      return () => subscription.unsubscribe();
    }
  }, [prev, observable, update]);
  return valueRef.current;
}
