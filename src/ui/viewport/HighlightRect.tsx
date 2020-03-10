import React, { useCallback, useState, useRef } from 'react';
import { ElementId, ScaffoldId } from 'base/id';
import { Vector, Rect } from 'base/math';
import useHovered from 'ui/hooks/useHovered';
import useSelected from 'ui/hooks/useSelected';
import useElementRect from 'ui/hooks/useElementRect';
import useElementRects from 'ui/hooks/useElementRects';
import useViewportRect, { useToViewportRect } from 'ui/hooks/useViewportRect';
import useDrop from 'ui/hooks/dnd/useDrop';
import { HighlightRect } from './components';
import { useMethod } from 'editor/di';
import { OperatorService } from 'editor/OperatorService';
import { DropEvent, HoverEvent } from 'base/DragAndDropService';
import { isBlueprintDragData, DnDType } from 'ui/hooks/dnd/types';
import useCanDrop from 'ui/hooks/useCanDrop';

const accepts = [DnDType.Blueprint];

function useOnDrop(id: ScaffoldId) {
  const append = useMethod(OperatorService, 'append');
  return useCallback(
    (e: DropEvent) => {
      // prevent drop to self
      if (e.source.element === e.destination.element) return;

      if (isBlueprintDragData(e.source.data)) {
        append(id, e.source.data.blueprint);
        return;
      }

      return;
    },
    [append, id]
  );
}

function useDropLayer(ref: React.RefObject<HTMLElement>, id: ScaffoldId) {
  const [hovered, setHovered] = useState(false);
  const canDrop = useCanDrop(id);
  const onDrop = useOnDrop(id);
  const onHover = useCallback((e: HoverEvent) => setHovered(e.hovered), []);
  useDrop(ref, { accepts, onHover, onDrop, canDrop });
  return hovered;
}

const HighlightHoveredImpl: React.FC<{ hovered: ElementId }> = props => {
  const { hovered } = props;
  const rect = useElementRect(hovered);
  const viewportRect = useViewportRect(rect);
  const ref = useRef<HTMLDivElement>(null);
  const dndHovered = useDropLayer(ref, hovered.scaffoldId);
  return <HighlightRect ref={ref} type="hovered" rect={viewportRect} dndHovered={dndHovered} />;
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
