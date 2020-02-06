import React, { useCallback } from 'react';
import { useObservable } from 'rxjs-hooks';
import { useService } from 'base/di';
import { WidgetType, ToolWidgetGroup, WidgetInfo } from 'editor/widget/WidgetRegistryService';
import { WidgetService } from 'editor/widget/WidgetService';
import { Tool } from 'editor/components/Toolbar';
import { FolderOpen, Save, Copy, Paste, Layer, Extension, Redo, Undo } from 'base/components/icons';

const ComponentsAndHierarchyTool: React.FC = () => {
  const id = 'components-and-hierarchy-panel';
  const widget = useService(WidgetService);
  const openedPanelId = useObservable(() => widget.openedPanelId$);
  const onClick = useCallback(() => widget.togglePanel(id), [widget]);
  return (
    <Tool active={openedPanelId === id} onClick={onClick}>
      <Layer size={24} title="Component &Hierarchy" />
    </Tool>
  );
};

const ExtensionsTool: React.FC = () => {
  const id = 'extensions-panel';
  const widget = useService(WidgetService);
  const openedPanelId = useObservable(() => widget.openedPanelId$);
  const onClick = useCallback(() => widget.togglePanel(id), [widget]);
  return (
    <Tool active={openedPanelId === id} onClick={onClick}>
      <Extension size={24} title="Extensions" />
    </Tool>
  );
};

const widgets: WidgetInfo[] = [
  {
    type: WidgetType.Tool,
    id: 'open-tool',
    group: ToolWidgetGroup.File,
    // eslint-disable-next-line react/display-name
    render: () => (
      <Tool>
        <FolderOpen size={16} title="Open" />
      </Tool>
    ),
  },
  {
    type: WidgetType.Tool,
    id: 'save-tool',
    group: ToolWidgetGroup.File,
    // eslint-disable-next-line react/display-name
    render: () => (
      <Tool>
        <Save size={16} title="Save" />
      </Tool>
    ),
  },
  {
    type: WidgetType.Tool,
    id: 'copy-tool',
    group: ToolWidgetGroup.Edit,
    // eslint-disable-next-line react/display-name
    render: () => (
      <Tool>
        <Copy size={16} title="Copy" />
      </Tool>
    ),
  },
  {
    type: WidgetType.Tool,
    id: 'paste-tool',
    group: ToolWidgetGroup.Edit,
    // eslint-disable-next-line react/display-name
    render: () => (
      <Tool>
        <Paste size={16} title="Paste" />
      </Tool>
    ),
  },
  {
    type: WidgetType.Tool,
    id: 'undo-tool',
    group: ToolWidgetGroup.Edit,
    // eslint-disable-next-line react/display-name
    render: () => (
      <Tool>
        <Undo size={16} title="Undo" />
      </Tool>
    ),
  },
  {
    type: WidgetType.Tool,
    id: 'redo-tool',
    group: ToolWidgetGroup.Edit,
    // eslint-disable-next-line react/display-name
    render: () => (
      <Tool>
        <Redo size={16} title="Redo" />
      </Tool>
    ),
  },
  {
    type: WidgetType.Tool,
    id: 'components-and-hierarchy-tool',
    group: ToolWidgetGroup.Panel,
    // eslint-disable-next-line react/display-name
    render: ComponentsAndHierarchyTool,
  },
  {
    type: WidgetType.Tool,
    id: 'extensions-tool',
    group: ToolWidgetGroup.Panel,
    // eslint-disable-next-line react/display-name
    render: ExtensionsTool,
  },
  {
    type: WidgetType.Panel,
    id: 'components-and-hierarchy-panel',
    // eslint-disable-next-line react/display-name
    render: () => <div>Component & Hierarchy</div>,
  },
  {
    type: WidgetType.Panel,
    id: 'extensions-panel',
    // eslint-disable-next-line react/display-name
    render: () => <div>Extensions</div>,
  },
];

export default widgets;
