import React, { useMemo, useRef, useCallback, useState } from 'react';
import styled, { css } from 'styled-components';
import * as theme from 'base/theme';
import { DropEvent, Draggable, HoverEvent } from 'base/DragAndDropService';
import { useMethodCall, useMethod } from 'editor/di';
import { BlueprintService, isBlueprint } from 'editor/BlueprintService';
import { EditorStateService } from 'editor/EditorStateService';
import { getElementId } from 'editor/ElementService';
import useSelected from 'ui/hooks/useSelected';
import useDrop from 'ui/hooks/dnd/useDrop';
import { DnDType } from 'ui/hooks/dnd/types';

const Container = styled.div``;

const Name = styled.div<{ selected?: boolean }>`
  padding: 8px;
  cursor: pointer;
  :hover {
    background-color: ${theme.get('component.layer.hovered.background')};
  }

  ${theme.props(
    'selected',
    css`
      background-color: ${theme.get('component.layer.selected.background')};
    `
  )}
`;

const Children = styled.div`
  padding-left: 16px;
`;

const accepts = [DnDType.Blueprint];

function useCanDrop(blueprintId: string) {
  const canInsertChild = useMethod(BlueprintService, 'canInsertChild');
  const canDrop = useCallback(
    (source: Draggable) => {
      if (!isBlueprint(source.data)) return false;
      return canInsertChild(blueprintId, source.data);
    },
    [canInsertChild, blueprintId]
  );
  return canDrop;
}

function useOnDrop(blueprintId: string) {
  const appendChild = useMethod(BlueprintService, 'appendChild');
  const onDrop = useCallback(
    (e: DropEvent) => {
      if (!isBlueprint(e.source.data)) return;
      appendChild(blueprintId, e.source.data);
    },
    [appendChild, blueprintId]
  );
  return onDrop;
}

export interface LayerProps {
  scope: string;
  blueprintId: string;
}

const Layer: React.FC<LayerProps> = props => {
  const { scope, blueprintId, children } = props;
  const elementId = useMemo(() => getElementId(scope, blueprintId), [scope, blueprintId]);
  const selected = useSelected();
  const blueprint = useMethodCall(BlueprintService, 'get', [blueprintId]);
  const select = useMethod(EditorStateService, 'select', [elementId]);
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const canDrop = useCanDrop(blueprintId);
  const onDrop = useOnDrop(blueprintId);
  const onHover = useCallback((e: HoverEvent) => setHovered(e.hovered), []);
  useDrop(ref, { accepts, onHover, onDrop, canDrop });
  return (
    <Container>
      <Name
        ref={ref}
        onClick={select}
        selected={selected.includes(elementId)}
        style={{ background: hovered ? 'red' : 'inherit' }}
      >
        {blueprint.type}
      </Name>
      {children && <Children>{children}</Children>}
    </Container>
  );
};

export default Layer;
