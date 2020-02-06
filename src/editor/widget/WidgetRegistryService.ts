import { Service } from 'typedi';
import {} from 'rxjs';

export enum WidgetType {
  Tool,
  Panel,
  Property,
  Popup,
}

interface BaseWidgetInfo {
  type: WidgetType;
}

export enum ToolWidgetGroup {
  File = 'File',
  Edit = 'Edit',
  Panel = 'Panel', // toolbar for listing all panels
}

export interface ToolWidgetInfo extends BaseWidgetInfo {
  type: WidgetType.Tool;
  id: string;
  render: React.JSXElementConstructor<{}>;
  group: ToolWidgetGroup;
  // tooltip?: string;
}

export interface PanelWidgetInfo extends BaseWidgetInfo {
  type: WidgetType.Panel;
  id: string;
  render: React.JSXElementConstructor<{}>;
}

export interface PropertyWidgetInfo extends BaseWidgetInfo {
  type: WidgetType.Property;
  title: string;
  render: React.JSXElementConstructor<{}>;
}

export interface PopupWidgetInfo extends BaseWidgetInfo {
  type: WidgetType.Popup;
  id: string;
  render: React.JSXElementConstructor<{}>;
}

export type WidgetInfo = ToolWidgetInfo | PanelWidgetInfo | PropertyWidgetInfo | PopupWidgetInfo;

@Service()
export class WidgetRegistryService {
  private toolWidgets = new Map<ToolWidgetGroup, ToolWidgetInfo[]>();

  private panelWidgets = new Map<string, PanelWidgetInfo>();

  private propertyWidgets: PropertyWidgetInfo[] = [];

  private popupWidgets = new Map<string, PopupWidgetInfo>();

  register(...widgets: WidgetInfo[]) {
    for (const widget of widgets) {
      switch (widget.type) {
        case WidgetType.Tool: {
          const group = this.toolWidgets.get(widget.group) || [];
          this.toolWidgets.set(widget.group, group);
          group.push(widget);
          break;
        }
        case WidgetType.Panel:
          this.panelWidgets.set(widget.id, widget);
          break;
        case WidgetType.Property:
          this.propertyWidgets.push(widget);
          break;
        case WidgetType.Popup:
          this.popupWidgets.set(widget.id, widget);
          break;
        default:
          break;
      }
    }
  }

  getToolWidgets(group: ToolWidgetGroup): ReadonlyArray<ToolWidgetInfo> {
    return this.toolWidgets.get(group) || [];
  }

  getPanelWidget(id: string) {
    return this.panelWidgets.get(id) || null;
  }

  getPropertyWidgets(): ReadonlyArray<PropertyWidgetInfo> {
    return this.propertyWidgets;
  }

  getPopupWidgets(): ReadonlyMap<string, PopupWidgetInfo> {
    return this.popupWidgets;
  }
}
