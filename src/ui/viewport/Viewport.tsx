import React, { useRef, useEffect, useMemo } from 'react';
import { Vector, Size } from 'base/math';
import { useProperty$, useMethod, useMethodCall } from 'editor/di';
import { ViewportService, ControlState } from 'editor/ViewportService';
import { ViewService } from 'editor/ViewService';
import { BlueprintService } from 'editor/BlueprintService';
import useViewRect from 'ui/hooks/useViewRect';
import { Viewport, Canvas } from './components';
import IsolatedView from './IsolatedView';
import Blueprint from './Blueprint';
import { HighlightHovered, HighlightSelected } from './HighlightRect';
import { EditorStateService } from 'editor/EditorStateService';

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

function useScopes() {
  useProperty$(BlueprintService, 'updateEvent$');
  return useMethodCall(BlueprintService, 'getRootNames', []);
}

const ConnectedViewport: React.FC = () => {
  const controlState = useProperty$(ViewportService, 'controlState$', ControlState.Default);

  const location = useProperty$(ViewportService, 'location$', Vector.zero);

  const scale = useProperty$(ViewportService, 'scale$', 1);

  const canvasSize = useProperty$(ViewportService, 'canvasSize$', Size.zero);

  const bindRef = useMethod(ViewportService, 'bind');

  const unbindRef = useMethod(ViewportService, 'unbind');

  const viewportRef = useRef<HTMLDivElement>(null);

  const canvasStyle = useMemo<React.CSSProperties>(
    () => ({
      transform: `scale(${scale.toFixed(4)}) translate(${location.x}px, ${location.y}px)`,
      width: `${canvasSize.width}px`,
      height: `${canvasSize.height}px`,
    }),
    [scale, location, canvasSize]
  );

  const scopes = useScopes();

  useEffect(() => {
    if (!viewportRef.current) return;
    bindRef(viewportRef.current);
    return () => unbindRef();
  }, [viewportRef, bindRef, unbindRef]);

  function renderView(scope: string) {
    return <ConnectedView key={scope} scope={scope} />;
  }

  return (
    <Viewport ref={viewportRef} cursor={getCursor(controlState)}>
      <Canvas style={canvasStyle}>{scopes.map(renderView)}</Canvas>
      <HighlightSelected />
      <HighlightHovered />
    </Viewport>
  );
};

interface ConnectedViewProps {
  scope: string;
}

const ConnectedView: React.FC<ConnectedViewProps> = props => {
  const { scope } = props;
  const [rect] = useViewRect(scope);
  const selectScope = useMethod(EditorStateService, 'setCurrentScope', [scope]);

  return (
    <IsolatedView
      disablePointerEvent
      x={rect.position.x}
      y={rect.position.y}
      width={rect.size.width}
      height={rect.size.height}
      onClick={selectScope}
    >
      <Blueprint scope={scope} />
    </IsolatedView>
  );
};

export default ConnectedViewport;
