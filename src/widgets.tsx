import React from 'react';
import { WidgetType, AnyWidget } from 'editor/widget/type';
import { FolderOpen, Save, Copy, Paste, Layer, Extension, History } from 'ui/components/icons';
import { Redo, Undo } from 'ui/widget/tool/Edit';
import OperationHistory from 'ui/widget/panel/OperationHistory';
import Hierarchy from 'ui/widget/panel/Hierarchy';
import * as inputs from 'ui/widget/inputs';

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
    render: Undo,
  },
  {
    type: WidgetType.Icon,
    id: 'redo',
    group: 'topbar.edit',
    render: Redo,
  },
  {
    type: WidgetType.Panel,
    id: 'components-and-hierarchy',
    // eslint-disable-next-line react/display-name
    renderIcon: () => <Layer title="Component & Hierarchy" />,
    // eslint-disable-next-line react/display-name
    renderPanel: Hierarchy,
  },
  {
    type: WidgetType.Panel,
    id: 'extensions',
    // eslint-disable-next-line react/display-name
    renderIcon: () => <Extension title="Extensions" />,
    // eslint-disable-next-line react/display-name
    renderPanel: () => <div>Extensions</div>,
  },
  {
    type: WidgetType.Panel,
    id: 'operation-history',
    // eslint-disable-next-line react/display-name
    renderIcon: () => <History title="History" />,
    renderPanel: OperationHistory,
  },
  {
    type: WidgetType.Input,
    forType: 'string',
    render: inputs.InputString,
  },
  {
    type: WidgetType.Input,
    forType: 'number',
    render: inputs.InputNumber,
  },
  {
    type: WidgetType.Input,
    forType: 'datetime',
    render: inputs.InputDate,
  },
  {
    type: WidgetType.Input,
    forType: 'boolean',
    render: inputs.InputDate,
  },
  {
    type: WidgetType.Input,
    forType: 'length',
    render: inputs.InputLength,
  },
  {
    type: WidgetType.Input,
    forType: 'color',
    render: inputs.InputColor,
  },
];

export default widgets;
