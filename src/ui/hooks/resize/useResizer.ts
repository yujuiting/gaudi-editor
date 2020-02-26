import { createElement, useRef } from 'react';
import { useDrag, DragElementWrapper, DragSourceOptions } from 'react-dnd';
import { generateId } from 'base/id';
import { DragType } from './shared';
import {
  Hitbox,
  UpHitbox,
  DownHitbox,
  LeftHitbox,
  RightHitbox,
  UpLeftHitbox,
  DownRightHitbox,
  UpRightHitbox,
  DownLefttHitbox,
} from './components';

export interface UseResizerParams {
  id: unknown;
  group?: string;
  thickness?: number;
  debug?: boolean;
}

function useResizer({ id, group, thickness = 10, debug = false }: UseResizerParams) {
  const uuid = useRef('');
  const begin = () => {
    uuid.current = generateId();
  };
  const [, upRef] = useDrag({ item: { type: DragType.Up, id, group, uuid: uuid.current }, begin });
  const [, downRef] = useDrag({
    item: { type: DragType.Down, id, group, uuid: uuid.current },
    begin,
  });
  const [, leftRef] = useDrag({
    item: { type: DragType.Left, id, group, uuid: uuid.current },
    begin,
  });
  const [, rightRef] = useDrag({
    item: { type: DragType.Right, id, group, uuid: uuid.current },
    begin,
  });
  const [, upLeftRef] = useDrag({
    item: { type: DragType.UpLeft, id, group, uuid: uuid.current },
    begin,
  });
  const [, downRightRef] = useDrag({
    item: { type: DragType.DownRight, id, group, uuid: uuid.current },
    begin,
  });
  const [, upRightRef] = useDrag({
    item: { type: DragType.UpRight, id, group, uuid: uuid.current },
    begin,
  });
  const [, downLeftRef] = useDrag({
    item: { type: DragType.DownLeft, id, group, uuid: uuid.current },
    begin,
  });

  function renderControllers() {
    function renderController(
      type: typeof Hitbox,
      ref: DragElementWrapper<DragSourceOptions>,
      key: string
    ) {
      return createElement(type, { ref, key, thickness, debug });
    }
    return [
      renderController(UpHitbox, upRef, DragType.Up),
      renderController(DownHitbox, downRef, DragType.Down),
      renderController(LeftHitbox, leftRef, DragType.Left),
      renderController(RightHitbox, rightRef, DragType.Right),
      renderController(UpLeftHitbox, upLeftRef, DragType.UpLeft),
      renderController(DownRightHitbox, downRightRef, DragType.DownRight),
      renderController(UpRightHitbox, upRightRef, DragType.UpRight),
      renderController(DownLefttHitbox, downLeftRef, DragType.DownLeft),
    ] as const;
  }

  return renderControllers;
}

export default useResizer;
