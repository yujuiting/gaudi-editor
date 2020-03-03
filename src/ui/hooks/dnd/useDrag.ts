import { useCallback, useState, useLayoutEffect } from 'react';
import { DragAndDropService, DragEvent } from 'base/DragAndDropService';
import { useMethod } from 'editor/di';
import { Vector } from 'base/math';

type DragInfo = Omit<DragEvent, 'source'>;

function useDrag(ref: React.RefObject<HTMLElement>, type?: string) {
  const register = useMethod(DragAndDropService, 'registerDraggable');
  const observeBeginDrag = useMethod(DragAndDropService, 'observeBeginDrag');
  const observeStopDrag = useMethod(DragAndDropService, 'observeStopDrag');
  const observeDrag = useMethod(DragAndDropService, 'observeDrag');
  const [dragging, setDragging] = useState(false);
  const [dragInfo, setDragInfo] = useState<DragInfo>({
    initial: Vector.zero,
    offset: Vector.zero,
    current: Vector.zero,
    diff: Vector.zero,
    delta: Vector.zero,
  });
  const handleDragEvent = useCallback((e: DragEvent, dragging: boolean) => {
    const { initial, offset, current, diff, delta } = e;
    setDragging(dragging);
    setDragInfo({ initial, offset, current, diff, delta });
  }, []);

  useLayoutEffect(() => {
    if (!ref.current) return;
    return register(ref.current, type);
  }, [ref, register, type]);

  useLayoutEffect(() => {
    const subscriptions = [
      observeBeginDrag(ref.current).subscribe(e => handleDragEvent(e, true)),
      observeDrag(ref.current).subscribe(e => handleDragEvent(e, true)),
      observeStopDrag(ref.current).subscribe(e => handleDragEvent(e, false)),
    ];
    return () => subscriptions.forEach(s => s.unsubscribe());
  }, [observeBeginDrag, observeStopDrag, observeDrag, handleDragEvent, ref]);

  return [dragging, dragInfo] as const;
}

export default useDrag;
