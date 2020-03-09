import React, { useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { Blueprint } from 'gaudi';
import { Vector } from 'base/math';
import useDrag from 'ui/hooks/dnd/useDrag';
import { DnDType, BlueprintDragData } from 'ui/hooks/dnd/types';
import useAppRoot from 'ui/hooks/useAppRoot';

const Container = styled.div`
  padding: 12px;
  margin: 8px;
  width: 120px;
  border: 1px solid;
`;

export interface Props {
  name: string;
  blueprint: Blueprint;
}

function getStyle(location: Vector): React.CSSProperties {
  return { position: 'absolute', left: location.x, top: location.y };
}

const PresetBlueprint: React.FC<Props> = props => {
  const { name, blueprint } = props;
  const ref = useRef<HTMLDivElement>(null);
  const appRoot = useAppRoot();
  const [dragging, { current, offset }] = useDrag(ref, {
    type: DnDType.Blueprint,
    data: BlueprintDragData.of(blueprint),
  });
  const style = useMemo(() => getStyle(current.add(offset)), [current, offset]);
  return (
    <>
      <Container ref={ref}>{name}</Container>
      {appRoot.current &&
        dragging &&
        createPortal(<Container style={style}>{name}</Container>, appRoot.current)}
    </>
  );
};

export default PresetBlueprint;
