import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { merge } from 'rxjs';
import { map } from 'rxjs/operators';
import { useObservable } from 'rxjs-hooks';
import { Vector, Size } from 'base/math';
import { useProperty$, useMethod, useProperty } from 'editor/di';
import { ViewportService, ControlState } from 'editor/ViewportService';
import { EditorStateService } from 'editor/EditorStateService';
import { ViewService } from 'editor/ViewService';
import { ScopeService } from 'editor/scope/ScopeService';
import useViewRect from 'ui/hooks/useViewRect';
import IsolatedView from 'ui/components/IsolatedView';
import { HighlightHovered, HighlightSelected } from './HighlightRect';
import useResizer from 'ui/hooks/resize/useResizer';
import { Viewport, Canvas, View } from './components';
import Scope from './Scope';

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

function useScopeNames() {
  const created$ = useProperty(ScopeService, 'created$');
  const destroyed$ = useProperty(ScopeService, 'destroyed$');
  const getNames = useMethod(ScopeService, 'getNames');
  return useObservable(() => merge(created$, destroyed$).pipe(map(() => getNames())), getNames());
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

  const scopeNames = useScopeNames();

  useEffect(() => {
    if (!viewportRef.current) return;
    bindRef(viewportRef.current);
    // connect(viewportRef.current);
    return () => unbindRef();
  }, [viewportRef, bindRef, unbindRef]);

  function renderView(scopeName: string) {
    return <ConnectedView key={scopeName} scopeName={scopeName} />;
  }

  return (
    <Viewport ref={viewportRef} cursor={getCursor(controlState)}>
      <Canvas style={canvasStyle}>{scopeNames.map(renderView)}</Canvas>
      <HighlightSelected />
      <HighlightHovered />
    </Viewport>
  );
};

interface ConnectedViewProps {
  scopeName: string;
}

const ConnectedView: React.FC<ConnectedViewProps> = props => {
  const { scopeName } = props;
  const [rect] = useViewRect(scopeName);
  const selectScope = useMethod(EditorStateService, 'setCurrentScope', [scopeName]);
  const resize = useMethod(ViewService, 'resize');
  const move = useMethod(ViewService, 'move');
  const onResize = useCallback((s: Size) => resize(scopeName, s), [scopeName, resize]);
  const onMove = useCallback((v: Vector) => move(scopeName, v), [scopeName, move]);
  const renderControllers = useResizer({ id: scopeName, group: 'view', onResize, onMove });

  return (
    <View
      x={rect.position.x}
      y={rect.position.y}
      width={rect.size.width}
      height={rect.size.height}
      onClick={selectScope}
    >
      <IsolatedView disablePointerEvent>
        <Scope scopeName={scopeName} />
      </IsolatedView>
      {renderControllers()}
    </View>
  );
};

export default ConnectedViewport;
