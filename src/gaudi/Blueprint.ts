import { JSONObject } from './JSON';

export interface Project extends JSONObject {
  readonly blueprints: Record<string, Blueprint>;
  // specify an entry template
  readonly entry: string;
  readonly metadata: {
    readonly plugins: string[];
    readonly version: string;
  };
  readonly data: Record<string, JSONObject>;
}

export interface Blueprint extends JSONObject {
  readonly type: string;
  readonly props?: JSONObject;
  readonly children?: Blueprint[];
}
