import React from 'react';
import styled from 'styled-components';
import * as theme from 'base/theme';
import { useMethodCall, useMethod } from 'editor/di';
import { BlueprintService, ImmutableBlueprint } from 'editor/BlueprintService';
import Layer from './Layer';
import { EditorStateService } from 'editor/EditorStateService';

const Container = styled.div``;

const Name = styled.div`
  cursor: pointer;
  padding: 8px;
  background-color: ${theme.get('component.input.hovered.background')};
`;

export interface ScopeProps {
  scope: string;
}

const Scope: React.FC<ScopeProps> = props => {
  const { scope } = props;
  const blueprint = useMethodCall(BlueprintService, 'getRoot', [scope]);
  const selectScope = useMethod(EditorStateService, 'setCurrentScope', [scope]);

  function renderLayer(blueprint: ImmutableBlueprint) {
    return (
      <Layer key={blueprint.id} scope={scope} blueprintId={blueprint.id}>
        {blueprint.children.map(renderLayer)}
      </Layer>
    );
  }

  return (
    <Container>
      <Name onClick={selectScope}>{scope}</Name>
      {renderLayer(blueprint)}
    </Container>
  );
};

export default Scope;
