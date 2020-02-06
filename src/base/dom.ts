import { Rect } from 'base/math';

export const getRect = (element: HTMLElement): Rect => {
  const { x, y, width, height } = element.getBoundingClientRect();
  return Rect.of(x, y, width, height);
};