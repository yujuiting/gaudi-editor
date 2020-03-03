import { useRef, useEffect } from 'react';

function usePrevious<T>(current: T): T {
  const ref = useRef(current);
  useEffect(() => {
    if (ref.current !== current) ref.current = current;
  }, [ref, current]);
  return ref.current;
}

export default usePrevious;
