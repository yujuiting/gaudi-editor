import React from 'react';
import styled from 'styled-components';
import { useMethodCall, useProperty$ } from 'editor/di';
import { ScopeService } from 'editor/scope/ScopeService';
import Scope from './Scope';

const Container = styled.div`
  width: 200px;
`;

function useScopeNames() {
  // trigger update when created or destroyed
  useProperty$(ScopeService, 'created$');
  useProperty$(ScopeService, 'destroyed$');
  return useMethodCall(ScopeService, 'getNames', []);
}

const Hierarchy: React.FC = () => {
  const scopeNames = useScopeNames();

  function renderScope(scopeName: string) {
    return <Scope key={scopeName} scopeName={scopeName} />;
  }

  return <Container>{scopeNames.map(renderScope)}</Container>;
};

export default Hierarchy;
