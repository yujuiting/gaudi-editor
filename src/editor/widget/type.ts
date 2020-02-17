export enum WidgetType {
  Icon,
  Panel,
  Props,
  Styles,
}

interface Widget {
  readonly type: WidgetType;
  readonly title?: string;
}

export interface IconWidget extends Widget {
  readonly type: WidgetType.Icon;
  readonly id: string;
  readonly group: string;
  readonly render: React.JSXElementConstructor<{}>;
}

export interface PanelWidget extends Widget {
  readonly type: WidgetType.Panel;
  readonly id: string;
  readonly renderIcon: React.JSXElementConstructor<{}>;
  readonly renderPanel: React.JSXElementConstructor<{}>;
}

export interface PropsWidget extends Widget {
  readonly type: WidgetType.Props;
  readonly id: string;
  readonly render: React.JSXElementConstructor<{}>;
}

export interface StylesWidget extends Widget {
  readonly type: WidgetType.Styles;
  readonly id: string;
  readonly render: React.JSXElementConstructor<{}>;
}

export type AnyWidget = IconWidget | PanelWidget | PropsWidget | StylesWidget;
