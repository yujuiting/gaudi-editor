import { useLayoutEffect } from 'react';
import { noop } from 'base/function';
import { DragAndDropService, HoverEvent, DropEvent } from 'base/DragAndDropService';
import { useMethod } from 'editor/di';

export interface UseDropParams {
  accepts: string[];
  onHover?: (e: HoverEvent) => void;
  onDrop?: (e: DropEvent) => void;
}

function useDrop(
  ref: React.RefObject<HTMLElement>,
  { accepts, onHover = noop, onDrop = noop }: UseDropParams
) {
  const register = useMethod(DragAndDropService, 'registerDroppable');
  const observeHover = useMethod(DragAndDropService, 'observeHover');
  const observeDrop = useMethod(DragAndDropService, 'observeDrop');

  useLayoutEffect(() => {
    console.log('useDrop', 'useEffect', ref);
    if (!ref.current) return;
    return register(ref.current, accepts);
  }, [ref, register, accepts]);

  useLayoutEffect(() => {
    const subscription = observeHover(ref.current).subscribe(onHover);
    return () => subscription.unsubscribe();
  }, [observeHover, onHover, ref]);

  useLayoutEffect(() => {
    const subscription = observeDrop(ref.current).subscribe(onDrop);
    return () => subscription.unsubscribe();
  }, [observeDrop, onDrop, ref]);
}

export default useDrop;
