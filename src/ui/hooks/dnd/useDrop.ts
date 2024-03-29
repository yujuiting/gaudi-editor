import { useLayoutEffect } from 'react';
import { noop } from 'base/function';
import { DragAndDropService, HoverEvent, DropEvent, Draggable } from 'base/DragAndDropService';
import { useMethod } from 'editor/di';

export interface UseDropParams {
  accepts: string[];
  onHover?: (e: HoverEvent) => void;
  onDrop?: (e: DropEvent) => void;
  canDrop?: (source: Draggable) => boolean;
}

function useDrop(
  ref: React.RefObject<HTMLElement>,
  { accepts, onHover = noop, onDrop = noop, canDrop }: UseDropParams
) {
  const register = useMethod(DragAndDropService, 'registerDroppable');
  const observeHover = useMethod(DragAndDropService, 'observeHover');
  const observeDrop = useMethod(DragAndDropService, 'observeDrop');

  useLayoutEffect(() => {
    if (!ref.current) return;
    return register(ref.current, { accepts, canDrop });
  }, [ref, register, accepts, canDrop]);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const subscription = observeHover(ref.current).subscribe(onHover);
    return () => subscription.unsubscribe();
  }, [observeHover, onHover, ref]);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const subscription = observeDrop(ref.current).subscribe(onDrop);
    return () => subscription.unsubscribe();
  }, [observeDrop, onDrop, ref]);
}

export default useDrop;
