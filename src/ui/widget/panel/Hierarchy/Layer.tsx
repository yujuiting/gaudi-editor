import React, { useMemo, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { css } from 'styled-components';
import * as theme from 'base/theme';
import { Vector } from 'base/math';
import { ScaffoldId, ElementId } from 'base/id';
import { DropEvent, HoverEvent } from 'base/DragAndDropService';
import { useMethod, useMethodCall } from 'editor/di';
import { EditorStateService } from 'editor/EditorStateService';
import { OperatorService } from 'editor/OperatorService';
import { ScaffoldService } from 'editor/scaffold/ScaffoldService';
import useSelected from 'ui/hooks/useSelected';
import useDrag from 'ui/hooks/dnd/useDrag';
import useDrop from 'ui/hooks/dnd/useDrop';
import useAppRoot from 'ui/hooks/useAppRoot';
import useCanDrop from 'ui/hooks/useCanDrop';
import useElementId from 'ui/hooks/useElementId';
import {
  DnDType,
  isBlueprintDragData,
  isScaffoldDragData,
  ScaffoldDragData,
} from 'ui/hooks/dnd/types';

const Container = styled.div``;

interface NameProps {
  hovered?: boolean;
  selected?: boolean;
}

const Name = styled.div<NameProps>`
  padding: 8px;
  cursor: pointer;
  :hover {
    background-color: ${theme.get('component.layer.hovered.background')};
  }

  ${theme.props(
    'hovered',
    css`
      background-color: ${theme.get('component.layer.hovered.background')};
    `
  )}

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

const accepts = [DnDType.Scaffold, DnDType.Blueprint];

function useOnDrop(id: ScaffoldId) {
  const append = useMethod(OperatorService, 'append');
  const moveToLast = useMethod(OperatorService, 'moveToLast');
  const isParent = useMethod(ScaffoldService, 'isParent');
  const onDrop = useCallback(
    (e: DropEvent) => {
      // prevent drop to self
      if (e.source.element === e.destination.element) return;

      if (isBlueprintDragData(e.source.data)) {
        append(id, e.source.data.blueprint);
        return;
      }

      if (!isScaffoldDragData(e.source.data)) {
        return;
      }

      if (isParent(id, e.source.data.id)) {
        return;
      }

      moveToLast(e.source.data.id, id);
    },
    [append, moveToLast, isParent, id]
  );
  return onDrop;
}

function useDropLayer(ref: React.RefObject<HTMLElement>, scaffoldId: ScaffoldId) {
  const [hovered, setHovered] = useState(false);
  const canDrop = useCanDrop(scaffoldId);
  const onDrop = useOnDrop(scaffoldId);
  const onHover = useCallback((e: HoverEvent) => setHovered(e.hovered), []);
  useDrop(ref, { accepts, onHover, onDrop, canDrop });
  return hovered;
}

function getStyle(location: Vector): React.CSSProperties {
  return { position: 'absolute', left: location.x, top: location.y };
}

function useDragLayer(ref: React.RefObject<HTMLElement>, scaffoldId: ScaffoldId) {
  const [dragging, { current, offset }] = useDrag(ref, {
    type: DnDType.Scaffold,
    data: ScaffoldDragData.of(scaffoldId),
  });
  const style = useMemo(() => getStyle(current.add(offset)), [current, offset]);
  return [dragging, style] as const;
}

export interface Props {
  scopeName: string;
  scaffoldId: ScaffoldId;
}

const Layer: React.FC<Props> = props => {
  const { scopeName, scaffoldId, children } = props;
  const appRoot = useAppRoot();
  const ref = useRef<HTMLDivElement>(null);
  const elementId = useElementId(scopeName, scaffoldId);
  const selected = useSelected();
  const select = useMethod(EditorStateService, 'select', [elementId]);
  const hovered = useDropLayer(ref, scaffoldId);
  const [dragging, style] = useDragLayer(ref, scaffoldId);
  const blueprintType = useMethodCall(ScaffoldService, 'getType', [scaffoldId]);

  return (
    <>
      <Container>
        <Name ref={ref} onClick={select} hovered={hovered} selected={selected.includes(elementId)}>
          {blueprintType}
        </Name>
        {children && <Children>{children}</Children>}
      </Container>
      {appRoot.current &&
        dragging &&
        createPortal(
          <Container>
            <Name style={style} hovered={true}>
              {blueprintType}
            </Name>
          </Container>,
          appRoot.current
        )}
    </>
  );
};

export default Layer;
