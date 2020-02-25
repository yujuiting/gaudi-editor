import { JSONValue } from 'gaudi';

export enum WidgetType {
  Icon,
  Panel,
  Props,
  Styles,
  Input,
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

export interface InputWidgetProps<T> {
  value?: T;
  onChange?: (value: T) => void;
  options?: { label: string; value: T; default?: boolean }[];
}

export interface InputWidget<T extends JSONValue = JSONValue> extends Widget {
  readonly type: WidgetType.Input;
  readonly forType: string;
  readonly render: React.JSXElementConstructor<InputWidgetProps<T>>;
}

export type AnyWidget = IconWidget | PanelWidget | PropsWidget | StylesWidget | InputWidget<any>;
