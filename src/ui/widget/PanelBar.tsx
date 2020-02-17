import React, { createElement, useCallback } from 'react';
import { WidgetService } from 'editor/widget/WidgetService';
import { PanelWidget } from 'editor/widget/type';
import { PanelService } from 'editor/widget/PanelService';
import { VToolGroup, Tool } from 'ui/components/Toolbar';
import { useProperty$, useMethodCall, useMethod } from 'editor/di';

interface PanelToolProps {
  active?: boolean;
  id: string;
}

const PanelTool: React.FC<PanelToolProps> = props => {
  const { active, id, children } = props;

  const toggle = useMethod(PanelService, 'toggle');

  const toggleThis = useCallback(() => toggle(id), [toggle, id]);

  return (
    <Tool key={id} active={active} onClick={toggleThis} size="large">
      {children}
    </Tool>
  );
};

const PanelBar: React.FC = () => {
  const panels = useMethodCall(WidgetService, 'getPanelWidgets', []);

  const opened = useProperty$(PanelService, 'openedId$', '');

  function renderTool(panel: PanelWidget) {
    return (
      <PanelTool active={opened === panel.id} id={panel.id}>
        {createElement(panel.renderIcon)}
      </PanelTool>
    );
  }

  return <VToolGroup>{panels.map(renderTool)}</VToolGroup>;
};

export default PanelBar;
