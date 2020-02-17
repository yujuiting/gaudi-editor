import React, { createElement } from 'react';
import { PanelService } from 'editor/widget/PanelService';
import { useProperty$, useMethod } from 'editor/di';

const PanelOutlet: React.FC = () => {
  // to trigger update
  useProperty$(PanelService, 'openedId$');

  const getOpenedPanel = useMethod(PanelService, 'getOpenedPanel');

  const panel = getOpenedPanel();

  if (!panel) return null;

  return createElement(panel.renderPanel);
};

export default PanelOutlet;
