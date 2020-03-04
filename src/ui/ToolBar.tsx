import React, { createElement, useMemo } from 'react';
import { IconWidget } from 'editor/widget/type';
import { WidgetService } from 'editor/widget/WidgetService';
import { HToolGroup, VToolGroup, Tool } from 'ui/components/Toolbar';
import { useMethod } from 'editor/di';

export interface Props {
  group: string;
  activeId?: string;
  vertical?: boolean;
}

const ToolBar: React.FC<Props> = ({ group, activeId, vertical }) => {
  const getIconWidgets = useMethod(WidgetService, 'getIconWidgets');

  const icons = useMemo(() => getIconWidgets().filter(widget => widget.group === group), [
    getIconWidgets,
    group,
  ]);

  function renderTool(tool: IconWidget) {
    // return (
    //   <Tool key={tool.id} active={activeId === tool.id} size="small">
    //     {createElement(tool.render)}
    //   </Tool>
    // );
    return <IconWidgetRenderer {...tool} active={activeId === tool.id} />;
  }

  const ToolGroup = vertical ? VToolGroup : HToolGroup;

  return <ToolGroup>{icons.map(renderTool)}</ToolGroup>;
};

export default ToolBar;

const IconWidgetRenderer: React.FC<IconWidget & { active: boolean }> = props => {
  const { active, id, render, useDisabled = () => false } = props;
  const disabled = useDisabled();
  return (
    <Tool key={id} active={active} size="small" disabled={disabled}>
      {createElement(render)}
    </Tool>
  );
};
