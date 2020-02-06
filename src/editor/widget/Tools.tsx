import React, { createElement } from 'react';
import { useService } from 'base/di';
import {
  ToolWidgetGroup,
  WidgetRegistryService,
  ToolWidgetInfo,
} from 'editor/widget/WidgetRegistryService';
import { HToolGroup, VToolGroup } from 'editor/components/Toolbar';

export interface ToolbarProps {
  group: ToolWidgetGroup;
  vertical?: boolean;
}

const Tools: React.FC<ToolbarProps> = ({ group, vertical }) => {
  const registry = useService(WidgetRegistryService);

  const tools = registry.getToolWidgets(group);

  function renderTool(tool: ToolWidgetInfo) {
    const key = tool.id;
    return createElement(tool.render, { key });
  }

  let ToolGroup = HToolGroup;

  if (vertical) ToolGroup = VToolGroup;

  return <ToolGroup>{tools.map(renderTool)}</ToolGroup>;
};

export default Tools;
