export type ComponentType<T = {}> = React.JSXElementConstructor<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ComponentModule<C extends ComponentType<any> = ComponentType<{}>> {
  default: C;
}
