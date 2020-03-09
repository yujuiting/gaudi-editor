import React from 'react';
import { ElementId } from 'base/id';
import { Vector, Rect } from 'base/math';
import useHovered from 'ui/hooks/useHovered';
import useSelected from 'ui/hooks/useSelected';
import useElementRect from 'ui/hooks/useElementRect';
import useElementRects from 'ui/hooks/useElementRects';
import useViewportRect, { useToViewportRect } from 'ui/hooks/useViewportRect';
import { HighlightRect } from './components';

const HighlightHoveredImpl: React.FC<{ hovered: ElementId }> = props => {
  const { hovered } = props;
  const rect = useElementRect(hovered);
  const viewportRect = useViewportRect(rect);
  return <HighlightRect type="hovered" rect={viewportRect} />;
};

export const HighlightHovered: React.FC = () => {
  const hovered = useHovered();
  if (!hovered) return null;
  return <HighlightHoveredImpl hovered={hovered} />;
};

export const HighlightSelected: React.FC = () => {
  const selected = useSelected();

  const rects = useElementRects(selected);

  const toViewportRect = useToViewportRect();

  let tl = Vector.maximin;
  let br = Vector.minimun;

  for (const rect of rects) {
    const { position, size } = rect;
    if (position.x < tl.x) tl = tl.setX(position.x);
    if (position.y < tl.y) tl = tl.setY(position.y);
    if (position.x + size.width > br.x) br = br.setX(position.x + size.width);
    if (position.y + size.height > br.y) br = br.setY(position.y + size.height);
  }

  const rect = toViewportRect(Rect.of(tl, br));

  return <HighlightRect type="selected" rect={rect} />;
};
