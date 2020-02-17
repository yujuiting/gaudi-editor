import React from 'react';
import { WidgetType, AnyWidget } from 'editor/widget/type';
import { FolderOpen, Save, Copy, Paste, Layer, Extension, Redo, Undo } from 'ui/components/icons';

const widgets: AnyWidget[] = [
  {
    type: WidgetType.Icon,
    id: 'open',
    group: 'topbar.file',
    // eslint-disable-next-line react/display-name
    render: () => <FolderOpen title="Open" />,
  },
  {
    type: WidgetType.Icon,
    id: 'save',
    group: 'topbar.file',
    // eslint-disable-next-line react/display-name
    render: () => <Save title="Save" />,
  },
  {
    type: WidgetType.Icon,
    id: 'copy',
    group: 'topbar.edit',
    // eslint-disable-next-line react/display-name
    render: () => <Copy title="Copy" />,
  },
  {
    type: WidgetType.Icon,
    id: 'paste',
    group: 'topbar.edit',
    // eslint-disable-next-line react/display-name
    render: () => <Paste title="Paste" />,
  },
  {
    type: WidgetType.Icon,
    id: 'undo',
    group: 'topbar.edit',
    // eslint-disable-next-line react/display-name
    render: () => <Undo title="Undo" />,
  },
  {
    type: WidgetType.Icon,
    id: 'redo',
    group: 'topbar.edit',
    // eslint-disable-next-line react/display-name
    render: () => <Redo title="Redo" />,
  },
  {
    type: WidgetType.Panel,
    id: 'components-and-hierarchy',
    // eslint-disable-next-line react/display-name
    renderIcon: () => <Layer title="Component &Hierarchy" />,
    // eslint-disable-next-line react/display-name
    renderPanel: () => <div>Component & Hierarchy</div>,
  },
  {
    type: WidgetType.Panel,
    id: 'extensions',
    // eslint-disable-next-line react/display-name
    renderIcon: () => <Extension title="Extensions" />,
    // eslint-disable-next-line react/display-name
    renderPanel: () => <div>Extensions</div>,
  },
];

export default widgets;
