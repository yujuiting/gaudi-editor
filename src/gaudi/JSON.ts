// we accoet undefined in type, and ignore it when serializing
export type JSONValue = string | number | boolean | null | JSONArray | JSONObject | undefined;
export type JSONArray = JSONValue[];
export type JSONObject = { [key: string]: JSONValue };

export function isJSONArray(value: JSONValue): value is JSONArray {
  return Array.isArray(value);
}

export function isJSONObject(value: JSONValue): value is JSONObject {
  return typeof value === 'object' && !isJSONArray(value);
}
