import React, { createElement } from 'react';
import { useObservable } from 'rxjs-hooks';
import { useService } from 'base/di';
import { WidgetService } from 'editor/widget/WidgetService';

const PanelOutlet: React.FC = () => {
  const widget = useService(WidgetService);

  const panel = useObservable(() => widget.openedPanel$);

  if (!panel) return null;

  return createElement(panel.render);
};

export default PanelOutlet;
