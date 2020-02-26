import React, { useCallback } from 'react';
import styled, { css } from 'styled-components';
import * as theme from 'base/theme';
import { useMethodCall, useMethod } from 'editor/di';
import { BlueprintService } from 'editor/BlueprintService';
import { EditorStateService } from 'editor/EditorStateService';
import { RenderedObjectService } from 'editor/RenderedObjectService';
import useSelected from 'ui/hooks/useSelected';

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

export interface LayerProps {
  scope: string;
  blueprintId: string;
}

const Layer: React.FC<LayerProps> = props => {
  const { scope, blueprintId, children } = props;
  const selected = useSelected();
  const blueprint = useMethodCall(BlueprintService, 'get', [blueprintId]);
  // const type = useMethodCall(BlueprintService, 'getType', [blueprintId]);
  // const obj = useMethodCall(RenderedObjectService, 'findByBlueprintId', [scope, blueprintId]);
  /**
   * @FIXME
   */
  const id = `${scope}-${blueprintId}`;
  const select = useMethod(EditorStateService, 'select', [id]);
  return (
    <Container>
      <Name onClick={select} selected={selected.includes(id)}>
        {blueprint.type}
      </Name>
      {children && <Children>{children}</Children>}
    </Container>
  );
};

export default Layer;
