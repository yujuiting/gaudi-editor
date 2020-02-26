import React from 'react';
import styled from 'styled-components';
import { BlueprintService } from 'editor/BlueprintService';
import { useMethodCall } from 'editor/di';
import Scope from './Scope';

const Container = styled.div`
  width: 200px;
`;

const Hierarchy: React.FC = () => {
  const scopes = useMethodCall(BlueprintService, 'getScopes', []);

  function renderScope(scope: string) {
    return <Scope key={scope} scope={scope} />;
  }

  return <Container>{scopes.map(renderScope)}</Container>;
};

export default Hierarchy;
