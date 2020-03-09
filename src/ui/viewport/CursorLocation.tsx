import React from 'react';
import { Vector } from 'base/math';
import { MouseService } from 'base/MouseService';
import { ViewportService } from 'editor/ViewportService';
import { useMethod, useProperty$ } from 'editor/di';

const CursorLocation: React.FC = () => {
  const location = useProperty$(MouseService, 'location$', Vector.zero);
  const pageToCanvasPoint = useMethod(ViewportService, 'pageToCanvasPoint');

  const { x, y } = pageToCanvasPoint(location);

  return (
    <div>
      Location:
      {x.toFixed(2)}, {y.toFixed(2)}
    </div>
  );
};

export default CursorLocation;
