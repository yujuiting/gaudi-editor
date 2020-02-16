import React from 'react';
import { map } from 'rxjs/operators';
import { useObservable } from 'rxjs-hooks';
import { Vector } from 'base/math';
import { ViewportService } from 'editor/ViewportService';
import { useMethod, useProperty } from 'editor/di';

const CursorLocation: React.FC = () => {
  const mousemove$ = useProperty(ViewportService, 'mousemove$');
  const pageToCanvasPoint = useMethod(ViewportService, 'pageToCanvasPoint');

  const { x, y } = useObservable(
    () => mousemove$.pipe(map(e => pageToCanvasPoint(Vector.of(e.pageX, e.pageY)))),
    Vector.zero
  );

  return (
    <div>
      {x.toFixed(2)}, {y.toFixed(2)}
    </div>
  );
};

export default CursorLocation;
