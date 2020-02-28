/* eslint-disable @typescript-eslint/no-explicit-any */

export type ComponentType = React.JSXElementConstructor<any>;

export interface ComponentModule {
  default: ComponentType & { displayName?: string; name?: string };
}

export function getComponentName(componentModule: ComponentModule) {
  if (typeof (componentModule.default as any).render === 'function') {
    return (componentModule.default as any).render.name;
  }
  return componentModule.default.displayName || componentModule.default.name || '';
}
