import { useMethod, useProperty$ } from 'editor/di';
import { ViewportService } from 'editor/ViewportService';
import { Rect } from 'base/math';

export function useToViewportRect() {
  useProperty$(ViewportService, 'location$');
  useProperty$(ViewportService, 'scale$');
  return useMethod(ViewportService, 'toViewportRect');
}

function useViewportRect(rect: Rect) {
  const toViewportRect = useToViewportRect();
  return toViewportRect(rect);
}

export default useViewportRect;
