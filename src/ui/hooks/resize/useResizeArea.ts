import { useDrop } from 'react-dnd';
import { useState, useRef } from 'react';
import { Vector, Size, Rect } from 'base/math';
import { pipe } from 'base/function';
import { DraggingObject, DragType } from './shared';

export interface UseResizeAreaParams {
  group?: string;
  onMove?: (delta: Vector, item: DraggingObject) => void;
  onResize?: (delta: Size, item: DraggingObject) => void;
}

const applyUpDelta = (delta: Vector) => (rect: Rect) =>
  Rect.of(rect.position.add(0, delta.y), rect.size.sub(0, delta.y));

const applyDownDelta = (delta: Vector) => (rect: Rect) =>
  Rect.of(rect.position, rect.size.add(0, delta.y));

const applyLeftDelta = (delta: Vector) => (rect: Rect) =>
  Rect.of(rect.position.add(delta.x, 0), rect.size.sub(delta.x, 0));

const applyRightDelta = (delta: Vector) => (rect: Rect) =>
  Rect.of(rect.position, rect.size.add(delta.x, 0));

function useResizeArea({
  group,
  onMove = () => void 0,
  onResize = () => void 0,
}: UseResizeAreaParams = {}) {
  const ref = useRef({
    target: undefined as unknown,
    prevLocation: Vector.zero,
    prevSize: Size.zero,
  });

  const [, connect] = useDrop({
    accept: [
      DragType.Up,
      DragType.Down,
      DragType.Left,
      DragType.Right,
      DragType.UpLeft,
      DragType.DownRight,
      DragType.UpRight,
      DragType.DownLeft,
    ],
    hover: (item: DraggingObject, monitor) => {
      if (group && item.group !== group) return;
      const diff = monitor.getDifferenceFromInitialOffset();
      if (!diff) return;

      if (ref.current.target !== item.uuid) {
        ref.current.target = item.uuid;
        ref.current.prevLocation = Vector.zero;
        ref.current.prevSize = Size.zero;
      }

      const delta = Vector.of(diff.x, diff.y);
      let rect = Rect.zero;

      if (item.type === DragType.Up) rect = applyUpDelta(delta)(rect);
      else if (item.type === DragType.Down) rect = applyDownDelta(delta)(rect);
      else if (item.type === DragType.Left) rect = applyLeftDelta(delta)(rect);
      else if (item.type === DragType.Right) rect = applyRightDelta(delta)(rect);
      else if (item.type === DragType.UpLeft)
        rect = pipe(applyUpDelta(delta), applyLeftDelta(delta))(rect);
      else if (item.type === DragType.DownRight)
        rect = pipe(applyDownDelta(delta), applyRightDelta(delta))(rect);
      else if (item.type === DragType.UpRight)
        rect = pipe(applyUpDelta(delta), applyRightDelta(delta))(rect);
      else if (item.type === DragType.DownLeft)
        rect = pipe(applyDownDelta(delta), applyLeftDelta(delta))(rect);

      if (rect.position !== Vector.zero) onMove(rect.position.sub(ref.current.prevLocation), item);
      if (rect.size !== Size.zero) onResize(rect.size.sub(ref.current.prevSize), item);

      ref.current.prevLocation = rect.position;
      ref.current.prevSize = rect.size;
    },
  });

  return connect;
}

export default useResizeArea;
