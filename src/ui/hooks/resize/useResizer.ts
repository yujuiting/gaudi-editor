import { createElement, useRef, useEffect, useCallback } from 'react';
import { pipe } from 'base/function';
import { Vector, Size, Rect } from 'base/math';
import useDrag from 'ui/hooks/dnd/useDrag';
import { DnDType } from 'ui/hooks/dnd/types';
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
  onMove?: (delta: Vector) => void;
  onResize?: (delta: Size) => void;
}

const applyUpDelta = (delta: Vector) => (rect: Rect) =>
  Rect.of(rect.position.add(0, delta.y), rect.size.sub(0, delta.y));

const applyDownDelta = (delta: Vector) => (rect: Rect) =>
  Rect.of(rect.position, rect.size.add(0, delta.y));

const applyLeftDelta = (delta: Vector) => (rect: Rect) =>
  Rect.of(rect.position.add(delta.x, 0), rect.size.sub(delta.x, 0));

const applyRightDelta = (delta: Vector) => (rect: Rect) =>
  Rect.of(rect.position, rect.size.add(delta.x, 0));

function useResizer({
  // id,
  // group,
  thickness = 10,
  debug = false,
  onMove = () => void 0,
  onResize = () => void 0,
}: UseResizerParams) {
  const upRef = useRef<HTMLDivElement>(null);
  const downRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const upLeftRef = useRef<HTMLDivElement>(null);
  const downRightRef = useRef<HTMLDivElement>(null);
  const upRightRef = useRef<HTMLDivElement>(null);
  const downLeftRef = useRef<HTMLDivElement>(null);
  const [, upInfo] = useDrag(upRef, DnDType.Resizer);
  const [, downInfo] = useDrag(downRef, DnDType.Resizer);
  const [, leftInfo] = useDrag(leftRef, DnDType.Resizer);
  const [, rightInfo] = useDrag(rightRef, DnDType.Resizer);
  const [, upLeftInfo] = useDrag(upLeftRef, DnDType.Resizer);
  const [, downRightInfo] = useDrag(downRightRef, DnDType.Resizer);
  const [, upRightInfo] = useDrag(upRightRef, DnDType.Resizer);
  const [, downLeftInfo] = useDrag(downLeftRef, DnDType.Resizer);
  const applyDelta = useCallback(
    (rect: Rect) => {
      if (rect.position !== Vector.zero) onMove(rect.position);
      if (rect.size !== Size.zero) onResize(rect.size);
    },
    [onMove, onResize]
  );

  useEffect(() => {
    applyDelta(applyUpDelta(upInfo.delta)(Rect.zero));
  }, [upInfo, onMove, onResize, applyDelta]);
  useEffect(() => {
    applyDelta(applyDownDelta(downInfo.delta)(Rect.zero));
  }, [downInfo, onMove, onResize, applyDelta]);
  useEffect(() => {
    applyDelta(applyLeftDelta(leftInfo.delta)(Rect.zero));
  }, [leftInfo, onMove, onResize, applyDelta]);
  useEffect(() => {
    applyDelta(applyRightDelta(rightInfo.delta)(Rect.zero));
  }, [rightInfo, onMove, onResize, applyDelta]);
  useEffect(() => {
    const rect = pipe(applyUpDelta(upLeftInfo.delta), applyLeftDelta(upLeftInfo.delta))(Rect.zero);
    applyDelta(rect);
  }, [upLeftInfo, onMove, onResize, applyDelta]);
  useEffect(() => {
    const rect = pipe(
      applyDownDelta(downRightInfo.delta),
      applyRightDelta(downRightInfo.delta)
    )(Rect.zero);
    applyDelta(rect);
  }, [downRightInfo, onMove, onResize, applyDelta]);
  useEffect(() => {
    const rect = pipe(
      applyUpDelta(upRightInfo.delta),
      applyRightDelta(upRightInfo.delta)
    )(Rect.zero);
    applyDelta(rect);
  }, [upRightInfo, onMove, onResize, applyDelta]);
  useEffect(() => {
    const rect = pipe(
      applyDownDelta(downLeftInfo.delta),
      applyDownDelta(downLeftInfo.delta)
    )(Rect.zero);
    applyDelta(rect);
  }, [downLeftInfo, onMove, onResize, applyDelta]);

  function renderControllers(): React.ReactChild[] {
    function renderController(
      type: typeof Hitbox,
      ref: React.RefObject<HTMLDivElement>,
      key: string
    ) {
      return createElement(type, { ref, key, thickness, debug });
    }
    return [
      renderController(UpHitbox, upRef, 'up-resizer'),
      renderController(DownHitbox, downRef, 'down-resizer'),
      renderController(LeftHitbox, leftRef, 'left-resizer'),
      renderController(RightHitbox, rightRef, 'right-resizer'),
      renderController(UpLeftHitbox, upLeftRef, 'up-left-resizer'),
      renderController(DownRightHitbox, downRightRef, 'down-right-resizer'),
      renderController(UpRightHitbox, upRightRef, 'up-right-resizer'),
      renderController(DownLefttHitbox, downLeftRef, 'down-left-resizer'),
    ];
  }

  return renderControllers;
}

export default useResizer;
