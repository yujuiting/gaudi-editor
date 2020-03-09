import { useRef, useEffect } from 'react';

function usePrevious<T>(current: T): T {
  const ref = useRef(current);
  useEffect(() => {
    ref.current = current;
  }, [current]);
  return ref.current;
}

export default usePrevious;
