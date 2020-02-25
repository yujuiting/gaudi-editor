import { Service } from 'typedi';
import {
  AnyWidget,
  IconWidget,
  PanelWidget,
  PropsWidget,
  StylesWidget,
  InputWidget,
  WidgetType,
} from 'editor/widget/type';

@Service()
export class WidgetService {
  private iconWidgets = new Map<string, IconWidget>();
  private panelWidgets = new Map<string, PanelWidget>();
  private propsWidgets = new Map<string, PropsWidget>();
  private stylesWidgets = new Map<string, StylesWidget>();
  private inputWidgets = new Map<string, InputWidget>();

  register(widget: AnyWidget) {
    switch (widget.type) {
      case WidgetType.Icon:
        this.registerIconWidget(widget);
        break;
      case WidgetType.Panel:
        this.registerPanelWidget(widget);
        break;
      case WidgetType.Props:
        this.registerPropsWidget(widget);
        break;
      case WidgetType.Styles:
        this.registerStylesWidget(widget);
        break;
      case WidgetType.Input:
        this.registerInputWidget(widget);
        break;
    }
  }

  registerAll(widgets: AnyWidget[]) {
    for (const widget of widgets) {
      this.register(widget);
    }
  }

  registerIconWidget(widget: IconWidget) {
    this.iconWidgets.set(widget.id, widget);
  }

  registerPanelWidget(widget: PanelWidget) {
    this.panelWidgets.set(widget.id, widget);
  }

  registerPropsWidget(widget: PropsWidget) {
    this.propsWidgets.set(widget.id, widget);
  }

  registerStylesWidget(widget: StylesWidget) {
    this.stylesWidgets.set(widget.id, widget);
  }

  registerInputWidget(widget: InputWidget) {
    this.inputWidgets.set(widget.forType, widget);
  }

  getIconWidgets() {
    return Array.from(this.iconWidgets.values());
  }

  getIconWidget(id: string) {
    return this.iconWidgets.get(id);
  }

  getPanelWidgets() {
    return Array.from(this.panelWidgets.values());
  }

  getPanelWidget(id: string) {
    return this.panelWidgets.get(id);
  }

  getPropsWidgets() {
    return Array.from(this.propsWidgets.values());
  }

  getPropsWidget(id: string) {
    return this.propsWidgets.get(id);
  }

  getStylesWidgets() {
    return Array.from(this.stylesWidgets.values());
  }

  getStylesWidget(id: string) {
    return this.stylesWidgets.get(id);
  }

  getInputWidget(forType: string) {
    return this.inputWidgets.get(forType);
  }
}
