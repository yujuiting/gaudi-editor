import { JSONObject } from './JSON';

export interface Blueprint extends JSONObject {
  readonly templates: Record<string, Template>;
  // specify an entry template
  readonly entry: string;
  readonly metadata: {
    readonly plugins: string[];
    readonly version: string;
  };
  readonly data: BlueprintData;
}

export type BlueprintData = { readonly [namespace: string]: JSONObject };

export interface Template extends JSONObject {
  readonly type: string;
  readonly props?: JSONObject;
  readonly children?: Template[];
}

export const createTemplate = (): Template => ({ type: 'div' });

// create an empty valid blueprint
export const createBlueprint = (): Blueprint => ({
  templates: { default: createTemplate() },
  entry: 'default',
  metadata: { plugins: [], version: '1.0.0' },
  data: {},
});
