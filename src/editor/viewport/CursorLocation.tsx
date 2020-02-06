import React from 'react';
import { map } from 'rxjs/operators';
import { useObservable } from 'rxjs-hooks';
import { useService } from 'base/di';
import { Vector } from 'base/math';
import { ViewportService } from 'editor/viewport/ViewportService';

const CursorLocation: React.FC = () => {
  const viewport = useService(ViewportService);

  const { x, y } = useObservable(
    () =>
      viewport.mousemove$.pipe(map(e => viewport.pageToCanvasPoint(Vector.of(e.pageX, e.pageY)))),
    Vector.zero
  );

  return (
    <div>
      {x.toFixed(2)}, {y.toFixed(2)}
    </div>
  );
};

export default CursorLocation;
