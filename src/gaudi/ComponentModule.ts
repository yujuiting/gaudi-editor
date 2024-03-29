/* eslint-disable @typescript-eslint/no-explicit-any */

export type ComponentType = React.JSXElementConstructor<any>;

export interface ComponentModule {
  default: ComponentType & { displayName?: string; name?: string };
}

export function getComponentName(componentModule: ComponentModule) {
  return componentModule.default.displayName || componentModule.default.name || '';
}
