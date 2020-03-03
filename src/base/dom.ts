import { Rect, Vector } from 'base/math';

export const getRect = (element: HTMLElement): Rect => {
  const { x, y, width, height } = element.getBoundingClientRect();
  return Rect.of(x, y, width, height);
};

export function getPagePointFromMouseEvent(e: MouseEvent) {
  return Vector.of(e.pageX, e.pageY);
}
