import React, { createElement } from 'react';
import { useObservable } from 'rxjs-hooks';
import { WidgetService } from 'editor/widget/WidgetService';
import { useProperty } from 'editor/di';

const PanelOutlet: React.FC = () => {
  const openedPanel$ = useProperty(WidgetService, 'openedPanel$');

  const panel = useObservable(() => openedPanel$);

  if (!panel) return null;

  return createElement(panel.render);
};

export default PanelOutlet;
