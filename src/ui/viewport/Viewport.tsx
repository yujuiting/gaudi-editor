import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { Vector, Size } from 'base/math';
import { useProperty$, useMethod, useMethodCall } from 'editor/di';
import { ViewportService, ControlState } from 'editor/ViewportService';
import { BlueprintService } from 'editor/BlueprintService';
import useViewRect from 'ui/hooks/useViewRect';
import { Viewport, Canvas, View } from './components';
import IsolatedView from './IsolatedView';
import Blueprint from './Blueprint';
import { HighlightHovered, HighlightSelected } from './HighlightRect';
import { EditorStateService } from 'editor/EditorStateService';
import useResizer from 'ui/hooks/resize/useResizer';
import { ViewService } from 'editor/ViewService';

const getCursor = (state: ControlState) => {
  switch (state) {
    case ControlState.CanPan:
      return 'grab';
    case ControlState.Panning:
      return 'grabbing';
    case ControlState.CanZoom:
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
  return useMethodCall(BlueprintService, 'getScopes', []);
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
    // connect(viewportRef.current);
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
  const resize = useMethod(ViewService, 'resize');
  const move = useMethod(ViewService, 'move');
  const onResize = useCallback((s: Size) => resize(scope, s), [scope, resize]);
  const onMove = useCallback((v: Vector) => move(scope, v), [scope, move]);
  const renderControllers = useResizer({ id: scope, group: 'view', onResize, onMove });

  return (
    <View
      x={rect.position.x}
      y={rect.position.y}
      width={rect.size.width}
      height={rect.size.height}
      onClick={selectScope}
    >
      <IsolatedView disablePointerEvent>
        <Blueprint scope={scope} />
      </IsolatedView>
      {renderControllers()}
    </View>
  );
};

export default ConnectedViewport;
