import React, { useRef, useMemo, useLayoutEffect } from 'react';
import styled from 'styled-components';
import { Blueprint } from 'gaudi';
import { Vector } from 'base/math';
import * as dom from 'base/dom';
import useDrag from 'ui/hooks/dnd/useDrag';
import { DnDType } from 'ui/hooks/dnd/types';

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

function getStyle(dragging: boolean, location: Vector): React.CSSProperties {
  if (!dragging) return { position: 'relative' };
  return { position: 'relative', left: location.x, top: location.y };
}

const PresetBlueprint: React.FC<Props> = props => {
  const { name, blueprint } = props;
  const ref = useRef<HTMLDivElement>(null);
  const location = useRef(Vector.zero);
  const [dragging, { current, offset }] = useDrag(ref, {
    type: DnDType.Blueprint,
    data: blueprint,
  });
  const style = useMemo(() => getStyle(dragging, current.add(offset).sub(location.current)), [
    dragging,
    current,
    offset,
    location,
  ]);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const rect = dom.getRect(ref.current);
    location.current = rect.position;
  }, [ref]);
  return (
    <Container style={style} ref={ref}>
      {name}
    </Container>
  );
};

export default PresetBlueprint;
