import React from 'react';
import * as Icon from 'ui/components/icons';
import { HistoryService } from 'editor/HistoryService';
import { useMethod } from 'editor/di';

export const Redo: React.FC = () => {
  const onClick = useMethod(HistoryService, 'redo');
  return <Icon.Redo title="Redo" onClick={onClick} />;
};

export const Undo: React.FC = () => {
  const onClick = useMethod(HistoryService, 'undo');
  return <Icon.Undo title="Undo" onClick={onClick} />;
};
