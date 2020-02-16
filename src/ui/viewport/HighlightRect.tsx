import React, { useMemo } from 'react';
import { map } from 'rxjs/operators';
import { useObservable } from 'rxjs-hooks';
import { Vector, Rect } from 'base/math';
import { useMethod, useProperty, useProperty$ } from 'editor/di';
import { ViewportService } from 'editor/ViewportService';
import { RenderedObjectService, RenderedObject } from 'editor/RenderedObjectService';
import { HighlightRect } from './components';

function useMouseLocation() {
  const mousemove$ = useProperty(ViewportService, 'mousemove$');
  return useObservable(() => mousemove$.pipe(map(e => Vector.of(e.pageX, e.pageY))), Vector.zero);
}

const ConnectedHighlightRect: React.FC = () => {
  // page coordinate
  const mouseLocation = useMouseLocation();

  const pageToCanvasPoint = useMethod(ViewportService, 'pageToCanvasPoint');

  const toViewportPoint = useMethod(ViewportService, 'toViewportPoint');

  const scale = useProperty$(ViewportService, 'scale$', 1);

  const findOn = useMethod(RenderedObjectService, 'findOn');

  const target = useMemo(() => {
    const result = findOn(pageToCanvasPoint(mouseLocation));
    let toppest: RenderedObject | undefined;
    for (const obj of result) {
      if (!toppest) {
        toppest = obj;
      } else if (toppest.info.depth > obj.info.depth) {
        toppest = obj;
      }
    }
    return toppest;
  }, [pageToCanvasPoint, mouseLocation, findOn]);

  if (!target) return null;

  const viewportPosition = toViewportPoint(target.rect.position);
  const viewportSize = target.rect.size.mul(scale);
  const rect = Rect.of(viewportPosition, viewportSize);

  return <HighlightRect rect={rect} />;
};

export default ConnectedHighlightRect;
