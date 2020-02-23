import React from 'react';
import { useProperty$, useMethod, useMethodCall } from 'editor/di';
import { EditorStateService } from 'editor/EditorStateService';
import { HighlightRect } from './components';
import { Vector, Rect } from 'base/math';
import { ViewportService } from 'editor/ViewportService';
import { RenderedObjectService } from 'editor/RenderedObjectService';

export const HighlightHovered: React.FC = () => {
  const hovered = useProperty$(EditorStateService, 'hovered$', '');

  const target = useMethodCall(RenderedObjectService, 'get', [hovered || '']);

  const toViewportRect = useMethod(ViewportService, 'toViewportRect');

  if (!target) return null;

  return <HighlightRect type="hovered" rect={toViewportRect(target.rect)} />;
};

export const HighlightSelected: React.FC = () => {
  const selected = useProperty$(EditorStateService, 'selected$');

  const getObject = useMethod(RenderedObjectService, 'get');

  const toViewportRect = useMethod(ViewportService, 'toViewportRect');

  if (!selected) return null;

  /**
   * cannot memo follow parts because rect of object will not update reference
   */
  let tl = Vector.maximin;
  let br = Vector.minimun;

  for (const objectId of selected) {
    const target = getObject(objectId);
    if (!target) continue;
    const { position, size } = target.rect;
    if (position.x < tl.x) tl = tl.setX(position.x);
    if (position.y < tl.y) tl = tl.setY(position.y);
    if (position.x + size.width > br.x) br = br.setX(position.x + size.width);
    if (position.y + size.height > br.y) br = br.setY(position.y + size.height);
  }

  const rect = toViewportRect(Rect.of(tl, br));

  return <HighlightRect type="selected" rect={rect} />;
};
