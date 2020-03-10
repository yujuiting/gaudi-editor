import React, { useCallback, useState, useRef } from 'react';
import styled from 'styled-components';
import { ScaffoldId } from 'base/id';
import { useMethod } from 'editor/di';
import { OperatorService } from 'editor/OperatorService';
import { ScaffoldService } from 'editor/scaffold/ScaffoldService';
import { DropEvent, HoverEvent } from 'base/DragAndDropService';
import { isBlueprintDragData, isScaffoldDragData, DnDType } from 'ui/hooks/dnd/types';
import useCanDrop from 'ui/hooks/useCanDrop';
import useDrop from 'ui/hooks/dnd/useDrop';

const accepts = [DnDType.Scaffold, DnDType.Blueprint];

const Hitbox = styled.div<{ hovered?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: height 0.2s;
  margin-top: -1px;
  margin-bottom: -1px;
  height: ${props => (props.hovered ? '10px' : '4px')};
`;

const Shape = styled.div`
  position: relative;
  transition: margin 0.2s;
  height: 2px;
  background-color: cyan;
  :after {
    display: block;
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background-color: inherit;
    position: absolute;
    left: 0;
    top: -3px;
  }
`;

function useOnDrop(id: ScaffoldId, at: number) {
  const insert = useMethod(OperatorService, 'insert');
  const move = useMethod(OperatorService, 'move');
  const isParent = useMethod(ScaffoldService, 'isParent');
  const onDrop = useCallback(
    (e: DropEvent) => {
      // prevent drop to self
      if (e.source.element === e.destination.element) return;

      if (isBlueprintDragData(e.source.data)) {
        insert(id, e.source.data.blueprint, at);
        return;
      }

      if (!isScaffoldDragData(e.source.data)) {
        return;
      }

      if (isParent(id, e.source.data.id)) {
        return;
      }

      move(e.source.data.id, id, at);
    },
    [insert, move, isParent, id, at]
  );
  return onDrop;
}

function useDropLayer(ref: React.RefObject<HTMLElement>, scaffoldId: ScaffoldId, at: number) {
  const [hovered, setHovered] = useState(false);
  const canDrop = useCanDrop(scaffoldId);
  const onDrop = useOnDrop(scaffoldId, at);
  const onHover = useCallback((e: HoverEvent) => setHovered(e.hovered), []);
  useDrop(ref, { accepts, onHover, onDrop, canDrop });
  return hovered;
}

export interface Props {
  scaffoldId: ScaffoldId;
  at: number;
}

const Placeholder: React.FC<Props> = props => {
  const { scaffoldId, at } = props;
  const ref = useRef<HTMLDivElement>(null);
  const hovered = useDropLayer(ref, scaffoldId, at);

  return (
    <Hitbox ref={ref} hovered={hovered}>
      {hovered && <Shape />}
    </Hitbox>
  );
};

export default Placeholder;
