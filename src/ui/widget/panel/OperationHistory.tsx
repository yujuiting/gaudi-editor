import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useProperty$, useMethod } from 'editor/di';
import { HistoryService } from 'editor/HistoryService';

const Wrapper = styled.div`
  width: 200px;
`;

const Operation = styled.div<{ active: boolean }>`
  cursor: pointer;
  border-bottom: solid 1px #999;
  padding: 6px;
  color: ${props =>
    props.active
      ? props.theme['operation-history.active-color']
      : props.theme['operation-history.inactive-color']};
`;

interface BindedOperationProps {
  version: number;
  active: boolean;
}

const BindedOperation: React.FC<BindedOperationProps> = props => {
  const { version, active, children } = props;

  const rollTo = useMethod(HistoryService, 'rollTo');

  const onClick = useCallback(() => rollTo(version), [rollTo, version]);

  return (
    <Operation active={active} onClick={onClick}>
      {children}
    </Operation>
  );
};

const OperationHistory: React.FC = () => {
  const history = useProperty$(HistoryService, 'history$', []);

  const current = useProperty$(HistoryService, 'current$', -1);

  function renderOperation(operation: string, index: number) {
    return (
      <BindedOperation active={index <= current} version={index} key={index}>
        {operation}
      </BindedOperation>
    );
  }

  function renderBody() {
    if (history.length === 0) return 'no history';

    return history.map(renderOperation);
  }

  return <Wrapper>{renderBody()}</Wrapper>;
};

export default OperationHistory;
