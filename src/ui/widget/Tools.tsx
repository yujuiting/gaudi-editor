import React, { createElement } from 'react';
import {
  ToolWidgetGroup,
  WidgetRegistryService,
  ToolWidgetInfo,
} from 'editor/widget/WidgetRegistryService';
import { HToolGroup, VToolGroup } from 'ui/components/Toolbar';
import { useMethod } from 'editor/di';

export interface ToolbarProps {
  group: ToolWidgetGroup;
  vertical?: boolean;
}

const Tools: React.FC<ToolbarProps> = ({ group, vertical }) => {
  const getToolWidgets = useMethod(WidgetRegistryService, 'getToolWidgets');

  const tools = getToolWidgets(group);

  function renderTool(tool: ToolWidgetInfo) {
    const key = tool.id;
    return createElement(tool.render, { key });
  }

  let ToolGroup = HToolGroup;

  if (vertical) ToolGroup = VToolGroup;

  return <ToolGroup>{tools.map(renderTool)}</ToolGroup>;
};

export default Tools;
