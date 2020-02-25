import React from 'react';
import styled from 'styled-components';
import * as theme from 'base/theme';
import { useMethodCall } from 'editor/di';
import { BlueprintService, ImmutableBlueprint } from 'editor/BlueprintService';
import Layer from './Layer';

const Container = styled.div`
  :not(:last-child) {
    border-bottom: 1px dotted;
  }
`;

const Name = styled.div`
  padding: 8px;
  background-color: ${theme.get('component.input.hovered.background')};
`;

export interface ScopeProps {
  scopeId: string;
}

const Scope: React.FC<ScopeProps> = props => {
  const { scopeId } = props;
  const blueprint = useMethodCall(BlueprintService, 'getRoot', [scopeId]);

  function renderLayer(blueprint: ImmutableBlueprint) {
    return (
      <Layer key={blueprint.id} blueprintId={blueprint.id}>
        {blueprint.children.map(renderLayer)}
      </Layer>
    );
  }

  return (
    <Container>
      <Name>{scopeId}</Name>
      {renderLayer(blueprint)}
    </Container>
  );
};

export default Scope;
