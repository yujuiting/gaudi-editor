import React, { useRef, useEffect, useMemo } from 'react';
import { useObservable } from 'rxjs-hooks';
import { useService } from 'base/di';
import { Vector, Size } from 'base/math';
import { CurrentBlueprintService } from 'editor/CurrentBlueprintService';
import { ViewportService, ControlState } from 'editor/viewport/ViewportService';
import { Viewport, Canvas } from './components';
import IsolatedView from './IsolatedView';
// import { ViewService } from './ViewService';

const getCursor = (state: ControlState) => {
  switch (state) {
    case ControlState.CanPan:
      return 'grab';
    case ControlState.Panning:
      return 'grabbing';
    case ControlState.CanPinch:
    case ControlState.ZoomingIn:
      return 'zoom-in';
    case ControlState.ZoomingOut:
      return 'zoom-out';
    default:
      return 'auto';
  }
};

const ConnectedViewport: React.FC = () => {
  const currentBlueprint = useService(CurrentBlueprintService);

  const entryElement = useObservable(() => currentBlueprint.entryElement$);

  const viewport = useService(ViewportService);

  const controlState = useObservable(() => viewport.controlState$, ControlState.Default);

  const location = useObservable(() => viewport.location$, Vector.zero);

  const scale = useObservable(() => viewport.scale$, 1);

  const canvasSize = useObservable(() => viewport.canvasSize$, Size.zero);

  const viewportRef = useRef<HTMLDivElement>(null);

  const canvasStyle = useMemo<React.CSSProperties>(
    () => ({
      transform: `scale(${scale.toFixed(4)}) translate(${location.x}px, ${location.y}px)`,
      width: `${canvasSize.width}px`,
      height: `${canvasSize.height}px`,
    }),
    [scale, location, canvasSize]
  );

  useEffect(() => {
    if (!viewportRef.current) return;
    viewport.bind(viewportRef.current);
    return () => viewport.unbind();
  }, [viewportRef, viewport]);

  function renderView() {
    return (
      <IsolatedView disablePointerEvent={controlState !== ControlState.Default}>
        {entryElement}
      </IsolatedView>
    );
  }

  return (
    <Viewport ref={viewportRef} cursor={getCursor(controlState)}>
      <Canvas style={canvasStyle}>{renderView()}</Canvas>
    </Viewport>
  );
};

export default ConnectedViewport;
