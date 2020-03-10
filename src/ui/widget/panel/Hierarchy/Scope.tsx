import React from 'react';
import styled from 'styled-components';
import * as theme from 'base/theme';
import { ReadonlyNode } from 'base/Node';
import { ScaffoldId } from 'base/id';
import { useMethod, useMethodCall, useProperty } from 'editor/di';
import { EditorStateService } from 'editor/EditorStateService';
import { ScopeService, filterScopeName, mapToScope } from 'editor/scope/ScopeService';
import { ScaffoldService } from 'editor/scaffold/ScaffoldService';

import Layer from './Layer';
import Placeholder from './Placeholder';
import { useObservable } from 'rxjs-hooks';
import { filter, map, debounceTime } from 'rxjs/operators';
import { merge } from 'rxjs';
import { useObserver } from 'ui/hooks/useUpdater';

const Container = styled.div``;

const Name = styled.div`
  cursor: pointer;
  padding: 8px;
  background-color: ${theme.get('component.input.hovered.background')};
`;

function useScope(scopeName: string) {
  const initial = useMethodCall(ScopeService, 'get', [scopeName]);
  const updated$ = useProperty(ScopeService, 'updated$');
  return useObservable(() => updated$.pipe(filterScopeName(scopeName), mapToScope()), initial);
}

function useNode(id: ScaffoldId) {
  const getNode = useMethod(ScaffoldService, 'getNode', [id]);
  const relationCreated$ = useProperty(ScaffoldService, 'relationCreated$');
  const relationDestroyed$ = useProperty(ScaffoldService, 'relationDestroyed$');
  return (
    useObserver(
      () =>
        merge(relationCreated$, relationDestroyed$).pipe(
          filter(e => e.id === id || e.parentId === id),
          debounceTime(100),
          map(() => getNode())
        ),
      [id]
    ) || getNode()
  );
}

export interface ScopeProps {
  scopeName: string;
}

const Scope: React.FC<ScopeProps> = props => {
  const { scopeName } = props;
  const scope = useScope(scopeName);
  const node = useNode(scope.root);
  const selectScope = useMethod(EditorStateService, 'setCurrentScope', [scopeName]);

  function renderLayer(
    node: ReadonlyNode<ScaffoldId>,
    parent: ReadonlyNode<ScaffoldId> | null = null,
    index = 0
  ) {
    const elements = [
      <Layer key={node.value.toString()} scopeName={scopeName} scaffoldId={node.value}>
        {node.children.map((child, index) => renderLayer(child, node, index))}
      </Layer>,
    ];

    if (parent && index === 0)
      elements.unshift(
        <Placeholder key={`${parent.value.toString()}-0`} scaffoldId={parent.value} at={0} />
      );

    if (parent)
      elements.push(
        <Placeholder
          key={`${parent.value.toString()}-${index + 1}`}
          scaffoldId={parent.value}
          at={index + 1}
        />
      );

    return elements;
  }

  return (
    <Container>
      <Name onClick={selectScope}>{scopeName}</Name>
      {renderLayer(node)}
    </Container>
  );
};

export default Scope;
