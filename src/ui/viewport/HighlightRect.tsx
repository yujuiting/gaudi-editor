import React, { useMemo } from 'react';
import { useMethod, useMethodCall } from 'editor/di';
import { HighlightRect } from './components';
import { Vector, Rect } from 'base/math';
import { ViewportService } from 'editor/ViewportService';
import useHovered from 'ui/hooks/useHovered';
import useSelected from 'ui/hooks/useSelected';
import useElementRect from 'ui/hooks/useElementRect';
import useElementRects from 'ui/hooks/useElementRects';

export const HighlightHovered: React.FC = () => {
  const hovered = useHovered();
  const rect = useElementRect(hovered || '');
  const viewportRect = useMethodCall(ViewportService, 'toViewportRect', [rect]);
  return <HighlightRect type="hovered" rect={viewportRect} />;
};

export const HighlightSelected: React.FC = () => {
  const selected = useSelected();

  const rects = useElementRects(selected);

  const toViewportRect = useMethod(ViewportService, 'toViewportRect');

  const rect = useMemo(() => {
    let tl = Vector.maximin;
    let br = Vector.minimun;

    for (const rect of rects) {
      const { position, size } = rect;
      if (position.x < tl.x) tl = tl.setX(position.x);
      if (position.y < tl.y) tl = tl.setY(position.y);
      if (position.x + size.width > br.x) br = br.setX(position.x + size.width);
      if (position.y + size.height > br.y) br = br.setY(position.y + size.height);
    }

    return toViewportRect(Rect.of(tl, br));
  }, [rects, toViewportRect]);

  return <HighlightRect type="selected" rect={rect} />;
};
